// crawl.ts — capture a list of pages: network.json, dom.html, mobile.png, desktop.png
// Usage: npx tsx crawl.ts [slug1 slug2 ...] OR npx tsx crawl.ts --marketing
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'fs/promises';

const BASE = 'https://menulab.com.tr';
const args = process.argv.slice(2);

const slugs: string[] = args.includes('--marketing')
  ? ['_home']
  : args.length > 0
  ? args
  : [];

if (slugs.length === 0) {
  console.error('Usage: npx tsx crawl.ts slug1 slug2 ... OR --marketing');
  process.exit(1);
}

for (const slug of slugs) {
  const url = slug === '_home' ? `${BASE}/` : `${BASE}/${slug}`;
  const dir = `captures/${slug}`;
  await mkdir(dir, { recursive: true });

  console.log(`\n[${slug}] → ${url}`);

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();

  const net: any[] = [];
  page.on('response', async (res) => {
    const ct = res.headers()['content-type'] || '';
    if (ct.includes('application/json') || ct.includes('text/json')) {
      try {
        const body = await res.json();
        net.push({ url: res.url(), status: res.status(), body });
      } catch {}
    }
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);

    // For the home page, scroll through all sections
    if (slug === '_home') {
      for (let i = 0; i <= 10; i++) {
        await page.evaluate((pct: number) => window.scrollTo(0, document.body.scrollHeight * pct / 10), i);
        await page.waitForTimeout(400);
      }
    }

    await writeFile(`${dir}/network.json`, JSON.stringify(net, null, 2));
    await writeFile(`${dir}/dom.html`, await page.content());
    await page.screenshot({ path: `${dir}/mobile.png`, fullPage: true });

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.screenshot({ path: `${dir}/desktop.png`, fullPage: true });

    const netCount = net.length;
    const status = await page.evaluate(() => document.title);
    console.log(`  ✓ captured | title: "${status}" | JSON responses: ${netCount}`);
  } catch (err: any) {
    console.error(`  ✗ error: ${err.message}`);
    await writeFile(`${dir}/error.txt`, err.message);
  }

  await browser.close();
}

console.log('\nAll done.');
