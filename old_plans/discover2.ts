// discover2.ts — deeper slug discovery via network intercept on catalog + home pages
// run: npx tsx discover2.ts
import { chromium } from 'playwright';
import { writeFile, mkdir } from 'fs/promises';

const BASE = 'https://menulab.com.tr';
const MARKETING = new Set(['', 'hakkimizda', 'kataloglar', 'nasil-calisir', 'basvur', 'iletisim', 'gizlilik-politikasi', 'kvkk', 'cerez-politikasi']);

async function collectPage(url: string, label: string) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const networkData: any[] = [];
  page.on('response', async (res) => {
    const ct = res.headers()['content-type'] || '';
    if (ct.includes('application/json') || ct.includes('text/json')) {
      try {
        const body = await res.json();
        networkData.push({ url: res.url(), status: res.status(), body });
      } catch {}
    }
  });

  console.log(`Loading ${url} ...`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Scroll to bottom to trigger lazy loads
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);

  const allHrefs = await page.$$eval('a[href]', (els) =>
    els.map((el) => (el as HTMLAnchorElement).getAttribute('href') || '')
  );

  const dom = await page.content();
  await browser.close();

  return { networkData, allHrefs, dom };
}

function extractSlugs(hrefs: string[]): string[] {
  const slugs: string[] = [];
  for (const href of hrefs) {
    try {
      let path: string;
      if (href.startsWith('http')) {
        const u = new URL(href);
        if (!u.hostname.includes('menulab.com.tr')) continue;
        path = u.pathname;
      } else {
        path = href;
      }
      const slug = path.replace(/^\//, '').split('?')[0].split('#')[0].split('/')[0];
      if (slug && !MARKETING.has(slug) && !slug.includes('.') && slug.length > 2) {
        slugs.push(slug);
      }
    } catch {}
  }
  return [...new Set(slugs)];
}

function extractSlugsFromNetwork(data: any[]): string[] {
  const text = JSON.stringify(data);
  const slugs: string[] = [];
  // Look for slug-like keys
  const reSlug = /"slug"\s*:\s*"([^"]+)"/g;
  const reUrl = /menulab\.com\.tr\/([a-z0-9-]+)/g;
  let m;
  while ((m = reSlug.exec(text)) !== null) slugs.push(m[1]);
  while ((m = reUrl.exec(text)) !== null) {
    if (!MARKETING.has(m[1])) slugs.push(m[1]);
  }
  return [...new Set(slugs)];
}

await mkdir('captures/_discovery', { recursive: true });

const pages = [
  { url: `${BASE}/kataloglar`, label: 'catalog' },
  { url: `${BASE}/`, label: 'home' },
  { url: `${BASE}/nasil-calisir`, label: 'how-it-works' },
];

const allSlugs = new Set<string>();

// Seed with confirmed slug from spec
allSlugs.add('dogan-restaurant');

for (const { url, label } of pages) {
  const { networkData, allHrefs, dom } = await collectPage(url, label);

  await writeFile(`captures/_discovery/${label}-network.json`, JSON.stringify(networkData, null, 2));
  await writeFile(`captures/_discovery/${label}-dom.html`, dom);

  const hrefSlugs = extractSlugs(allHrefs);
  const netSlugs = extractSlugsFromNetwork(networkData);

  console.log(`  ${label}: ${hrefSlugs.length} href slugs, ${netSlugs.length} network slugs`);
  console.log(`    href slugs: ${JSON.stringify(hrefSlugs)}`);
  console.log(`    net slugs: ${JSON.stringify(netSlugs)}`);

  hrefSlugs.forEach(s => allSlugs.add(s));
  netSlugs.forEach(s => allSlugs.add(s));
}

// Also try to parse sitemap as raw text
try {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const res = await page.goto(`${BASE}/sitemap.xml`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  const raw = await page.evaluate(() => document.documentElement.outerHTML);
  await writeFile('captures/_discovery/sitemap-raw.html', raw);
  const re = /menulab\.com\.tr\/([a-z0-9-]+)/g;
  let m;
  while ((m = re.exec(raw)) !== null) {
    if (!MARKETING.has(m[1])) allSlugs.add(m[1]);
  }
  await browser.close();
  console.log('Sitemap parsed.');
} catch (e) {
  console.log('Sitemap failed:', e);
}

const slugList = [...allSlugs].filter(s => !MARKETING.has(s)).sort();
console.log(`\nTotal unique restaurant slugs: ${slugList.length}`);
console.log(slugList);

await writeFile('slugs.json', JSON.stringify(slugList, null, 2));
console.log('Written to slugs.json');
