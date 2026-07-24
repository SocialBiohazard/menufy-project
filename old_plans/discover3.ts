// discover3.ts — render home page sections, check dogan-restaurant, find all slugs
import { chromium } from 'playwright';
import { writeFile, mkdir } from 'fs/promises';

const BASE = 'https://menulab.com.tr';
const MARKETING = new Set(['hakkimizda', 'kataloglar', 'nasil-calisir', 'basvur', 'iletisim', 'gizlilik-politikasi', 'kvkk', 'cerez-politikasi', 'basvuru']);

await mkdir('captures/_discovery', { recursive: true });

const browser = await chromium.launch({ headless: true });

// Phase 1: scroll full home page + capture all slugs
{
  const page = await browser.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 30000 });

  // Scroll slowly to trigger lazy loads
  for (let i = 0; i <= 10; i++) {
    await page.evaluate((pct) => window.scrollTo(0, document.body.scrollHeight * pct / 10), i);
    await page.waitForTimeout(800);
  }
  await page.waitForTimeout(2000);

  const dom = await page.content();
  await writeFile('captures/_discovery/home-full-dom.html', dom);

  // Extract all absolute links to menulab.com.tr
  const slugs = await page.$$eval('a[href]', (els) => {
    const results: string[] = [];
    for (const el of els as HTMLAnchorElement[]) {
      const href = el.getAttribute('href') || '';
      let slug = '';
      if (href.startsWith('https://menulab.com.tr/')) {
        slug = href.replace('https://menulab.com.tr/', '').split('?')[0].split('#')[0];
      } else if (href.startsWith('/') && !href.startsWith('/_')) {
        slug = href.replace(/^\//, '').split('?')[0].split('#')[0];
      }
      if (slug && slug.length > 2) results.push(slug);
    }
    return results;
  });

  // Also grep the raw DOM for any slug-like paths
  const re = /menulab\.com\.tr\/([a-z0-9][a-z0-9-]{2,})/g;
  let m;
  while ((m = re.exec(dom)) !== null) slugs.push(m[1]);

  const unique = [...new Set(slugs)].filter(s => !MARKETING.has(s)).sort();
  console.log(`Home page slugs (after scroll): ${unique.length}`);
  console.log(unique);

  // Screenshot of the kataloglar section
  await page.goto(`${BASE}/#kataloglar`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: 'captures/_discovery/home-kataloglar-section.png', fullPage: false });
  await page.screenshot({ path: 'captures/_discovery/home-full.png', fullPage: true });

  await page.close();
}

// Phase 2: confirm dogan-restaurant exists
{
  const page = await browser.newPage();
  const resp = await page.goto(`${BASE}/dogan-restaurant`, { waitUntil: 'networkidle', timeout: 20000 });
  const status = resp?.status();
  console.log(`\ndogan-restaurant status: ${status}`);
  const title = await page.title();
  console.log(`  title: ${title}`);
  await page.close();
}

// Phase 3: try guessing other slugs from pattern (check head requests)
// The 9 home-page slugs + dogan = 10. The spec says ~29.
// Let's check if there's a robots.txt with more info
{
  const page = await browser.newPage();
  await page.goto(`${BASE}/robots.txt`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  const txt = await page.content();
  await writeFile('captures/_discovery/robots.txt', txt);
  console.log('\nrobots.txt:', txt.slice(0, 500));
  await page.close();
}

await browser.close();
console.log('\nDone. Check captures/_discovery/');
