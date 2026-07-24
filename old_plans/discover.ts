// discover.ts — finds all live restaurant slugs from sitemap.xml + catalog page
// run: npx tsx discover.ts
import { chromium } from 'playwright';
import { writeFile, mkdir } from 'fs/promises';

const BASE = 'https://menulab.com.tr';
const MARKETING_PATHS = new Set(['', '/', '/hakkimizda', '/kataloglar', '/nasil-calisir', '/basvur', '/iletisim', '/gizlilik', '/kvkk']);

async function fromSitemap(browser: Awaited<ReturnType<typeof chromium.launch>>): Promise<string[]> {
  const page = await browser.newPage();
  try {
    const res = await page.goto(`${BASE}/sitemap.xml`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const xml = await page.content();
    const slugs: string[] = [];
    const re = /https?:\/\/menulab\.com\.tr\/([^<"\s]+)/g;
    let m;
    while ((m = re.exec(xml)) !== null) {
      const path = '/' + m[1].split('?')[0].split('#')[0];
      if (!MARKETING_PATHS.has(path) && !path.includes('.') && path.length > 1) {
        slugs.push(m[1]);
      }
    }
    return [...new Set(slugs)];
  } finally {
    await page.close();
  }
}

async function fromCatalog(browser: Awaited<ReturnType<typeof chromium.launch>>): Promise<string[]> {
  const page = await browser.newPage();
  try {
    await page.goto(`${BASE}/kataloglar`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(2000);
    const hrefs = await page.$$eval('a[href]', (els) =>
      els.map((el) => (el as HTMLAnchorElement).getAttribute('href') || '')
    );
    const slugs: string[] = [];
    for (const href of hrefs) {
      // relative or absolute slug links, not marketing pages
      const path = href.startsWith('http') ? new URL(href).pathname : href;
      const slug = path.replace(/^\//, '').split('?')[0].split('#')[0];
      if (slug && !MARKETING_PATHS.has('/' + slug) && !slug.includes('/') && !slug.includes('.')) {
        slugs.push(slug);
      }
    }
    return [...new Set(slugs)];
  } finally {
    await page.close();
  }
}

async function fromHome(browser: Awaited<ReturnType<typeof chromium.launch>>): Promise<string[]> {
  const page = await browser.newPage();
  try {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(2000);
    const hrefs = await page.$$eval('a[href]', (els) =>
      els.map((el) => (el as HTMLAnchorElement).getAttribute('href') || '')
    );
    const slugs: string[] = [];
    for (const href of hrefs) {
      const path = href.startsWith('http') ? new URL(href).pathname : href;
      const slug = path.replace(/^\//, '').split('?')[0].split('#')[0];
      if (slug && !MARKETING_PATHS.has('/' + slug) && !slug.includes('/') && !slug.includes('.')) {
        slugs.push(slug);
      }
    }
    return [...new Set(slugs)];
  } finally {
    await page.close();
  }
}

const browser = await chromium.launch({ headless: true });
console.log('Fetching sitemap.xml...');
const sitemapSlugs = await fromSitemap(browser);
console.log(`  sitemap: ${sitemapSlugs.length} slugs`);

console.log('Scraping catalog page...');
const catalogSlugs = await fromCatalog(browser);
console.log(`  catalog: ${catalogSlugs.length} slugs`);

console.log('Scraping home page...');
const homeSlugs = await fromHome(browser);
console.log(`  home: ${homeSlugs.length} slugs`);

await browser.close();

const all = [...new Set([...sitemapSlugs, ...catalogSlugs, ...homeSlugs])].sort();
console.log(`\nTotal unique slugs: ${all.length}`);
console.log(all);

await mkdir('captures', { recursive: true });
await writeFile('slugs.json', JSON.stringify(all, null, 2));
console.log('\nWritten to slugs.json');
