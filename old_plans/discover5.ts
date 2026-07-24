// discover5.ts — interact with kataloglar filters + intercept network to find all slugs
import { chromium } from 'playwright';
import { writeFile, mkdir } from 'fs/promises';

const BASE = 'https://menulab.com.tr';
const MARKETING = new Set(['hakkimizda', 'kataloglar', 'nasil-calisir', 'basvur', 'iletisim', 'gizlilik-politikasi', 'kvkk', 'cerez-politikasi', 'basvuru']);

await mkdir('captures/_discovery', { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });

const networkData: any[] = [];
page.on('response', async (res) => {
  const ct = res.headers()['content-type'] || '';
  if (ct.includes('json')) {
    try {
      const body = await res.json();
      networkData.push({ url: res.url(), body });
    } catch {}
  }
});

await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);

// Scroll to kataloglar section
await page.evaluate(() => {
  const el = document.getElementById('kataloglar');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
});
await page.waitForTimeout(2000);

// Find all filter buttons and click each one
const filterButtons = await page.$$eval('[id="kataloglar"] button, [id="kataloglar"] [role="tab"], [id="kataloglar"] a[data-filter]',
  els => els.map(el => ({ text: (el as HTMLElement).innerText.trim(), tag: el.tagName }))
);
console.log('Filter buttons found:', filterButtons);

// Also try getting all clickable items near the category list
const allButtons = await page.$$eval('button', els => els.map(el => (el as HTMLElement).innerText.trim()).filter(t => t.length < 50));
console.log('All buttons on page:', allButtons.slice(0, 30));

// Collect all current slugs from DOM
const getAllSlugs = async () => {
  const dom = await page.content();
  const slugs = new Set<string>();
  const re = /menulab\.com\.tr\/([a-z0-9][a-z0-9-]{2,})(?=[^a-z0-9-]|$)/g;
  let m;
  while ((m = re.exec(dom)) !== null) {
    if (!MARKETING.has(m[1])) slugs.add(m[1]);
  }
  // Also grab any href attributes
  const hrefs = await page.$$eval('a[href*="menulab.com.tr/"]', els =>
    els.map(el => {
      const href = (el as HTMLAnchorElement).href;
      return href.replace('https://menulab.com.tr/', '').split('?')[0].split('#')[0];
    })
  );
  hrefs.forEach(s => { if (s && s.length > 2) slugs.add(s); });
  return slugs;
};

const initial = await getAllSlugs();
console.log('\nInitial slugs:', [...initial].sort());

// Try clicking category filter buttons (they're in the kataloglar section)
const categorySelectors = [
  '[id="kataloglar"] button',
  'button[class*="filter"]',
  'button[class*="category"]',
  'button[class*="tab"]',
];

const allSlugs = new Set<string>(initial);

for (const selector of categorySelectors) {
  const btns = await page.$$(selector);
  if (btns.length > 0) {
    console.log(`\nFound ${btns.length} buttons with selector: ${selector}`);
    for (let i = 0; i < btns.length; i++) {
      try {
        await btns[i].click();
        await page.waitForTimeout(1500);
        const slugs = await getAllSlugs();
        slugs.forEach(s => allSlugs.add(s));
        const btnText = await btns[i].evaluate(el => (el as HTMLElement).innerText.trim());
        console.log(`  After clicking "${btnText}": total unique slugs = ${allSlugs.size}`);
      } catch {}
    }
    break; // Only try the first successful selector
  }
}

// Save network data
await writeFile('captures/_discovery/home-network.json', JSON.stringify(networkData, null, 2));
console.log(`\nNetwork calls captured: ${networkData.length}`);
console.log('Network URLs:', networkData.map(n => n.url));

const finalSlugs = [...allSlugs].filter(s => !MARKETING.has(s)).sort();
console.log(`\nFinal unique slugs: ${finalSlugs.length}`);
console.log(finalSlugs);

await writeFile('slugs.json', JSON.stringify(finalSlugs, null, 2));

await page.screenshot({ path: 'captures/_discovery/kataloglar-after-clicks.png', fullPage: false });

await browser.close();
