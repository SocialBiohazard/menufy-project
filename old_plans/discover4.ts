// discover4.ts — screenshot kataloglar section + check dogan + robots
import { chromium } from 'playwright';
import { writeFile, mkdir } from 'fs/promises';

const BASE = 'https://menulab.com.tr';

await mkdir('captures/_discovery', { recursive: true });

const browser = await chromium.launch({ headless: true });

// Screenshot full home page (already loaded) and kataloglar section
{
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 30000 });

  // Scroll slowly
  for (let i = 0; i <= 15; i++) {
    await page.evaluate((pct) => window.scrollTo(0, document.body.scrollHeight * pct / 15), i);
    await page.waitForTimeout(600);
  }
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'captures/_discovery/home-full.png', fullPage: true });

  // Scroll to kataloglar anchor
  await page.evaluate(() => {
    const el = document.getElementById('kataloglar') || document.querySelector('[id*="katalog"]');
    if (el) el.scrollIntoView();
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'captures/_discovery/kataloglar-section.png', fullPage: false });

  // Get all text content in kataloglar section
  const katalogText = await page.evaluate(() => {
    const el = document.getElementById('kataloglar') || document.querySelector('[id*="katalog"]') || document.querySelector('section');
    return el ? el.innerText : 'not found';
  });
  console.log('kataloglar section text sample:', katalogText.slice(0, 500));

  // Count all slugs in DOM one more time
  const dom = await page.content();
  const re = /menulab\.com\.tr\/([a-z0-9][a-z0-9-]{2,})(?=[^a-z0-9-])/g;
  const slugs = new Set<string>();
  let m;
  while ((m = re.exec(dom)) !== null) slugs.add(m[1]);
  console.log('\nSlugs in home DOM:', [...slugs].sort());

  await page.close();
}

// Check dogan-restaurant
{
  const page = await browser.newPage();
  const resp = await page.goto(`${BASE}/dogan-restaurant`, { waitUntil: 'networkidle', timeout: 25000 });
  console.log(`\ndogan-restaurant HTTP status: ${resp?.status()}`);
  console.log(`  title: ${await page.title()}`);
  await page.close();
}

// robots.txt
{
  const page = await browser.newPage();
  await page.goto(`${BASE}/robots.txt`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  const body = await page.evaluate(() => document.body.innerText);
  await writeFile('captures/_discovery/robots.txt', body);
  console.log('\nrobots.txt:\n', body.slice(0, 500));
  await page.close();
}

await browser.close();
console.log('\nDone.');
