const { chromium } = require("../old_plans/node_modules/playwright");

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--host-resolver-rules=MAP inci-preview.test 127.0.0.1"],
  });
  const issues = [];
  const url = "http://localhost:3000/inci-design-preview?preview=1";

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mobile.on("console", (message) => {
    if (message.type() === "error") issues.push(`console: ${message.text()}`);
  });
  mobile.on("pageerror", (error) => issues.push(`pageerror: ${error.message}`));

  const response = await mobile.goto(url, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await mobile.waitForLoadState("networkidle", { timeout: 90_000 });
  console.log(`mobile status=${response?.status()} title=${await mobile.title()}`);
  console.log((await mobile.locator("body").innerText()).slice(0, 800));
  await mobile.screenshot({ path: "reference/qa/inci/mobile-splash.png", fullPage: true });

  const enter = mobile.getByRole("button", { name: "Menüyü keşfet" });
  await enter.click();
  await mobile.waitForTimeout(500);
  console.log(`after enter: ${(await mobile.locator("body").innerText()).slice(0, 800)}`);
  await mobile.screenshot({ path: "reference/qa/inci/mobile-categories.png", fullPage: true });

  const categoryCards = mobile.locator("main button");
  console.log(`category buttons=${await categoryCards.count()}`);
  if ((await categoryCards.count()) === 0) {
    console.log(`browser issues=${JSON.stringify(issues)}`);
    await browser.close();
    process.exitCode = 1;
    return;
  }
  await categoryCards.first().click();
  await mobile.waitForTimeout(350);
  await mobile.screenshot({ path: "reference/qa/inci/mobile-category.png", fullPage: true });

  const itemCards = mobile.locator("main button");
  console.log(`category view buttons=${await itemCards.count()}`);
  await itemCards.nth(1).click();
  await mobile.waitForTimeout(350);
  await mobile.screenshot({ path: "reference/qa/inci/mobile-item.png", fullPage: true });

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await desktop.goto(url, { waitUntil: "networkidle", timeout: 90_000 });
  await desktop.screenshot({ path: "reference/qa/inci/desktop-splash.png", fullPage: true });
  await desktop.getByRole("button", { name: "Menüyü keşfet" }).click();
  await desktop.waitForTimeout(350);
  await desktop.screenshot({ path: "reference/qa/inci/desktop-categories.png", fullPage: true });

  const hostContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const hostPage = await hostContext.newPage();
  const hostResponse = await hostPage.goto("http://inci-preview.test:3000/", { waitUntil: "networkidle", timeout: 90_000 });
  const hostText = await hostPage.locator("body").innerText();
  console.log(`hostname status=${hostResponse?.status()} matched=${hostText.includes("İnci Cafe Restaurant")}`);
  if (hostResponse?.status() !== 200 || !hostText.includes("İnci Cafe Restaurant")) {
    issues.push("custom hostname did not resolve to the İnci fixture");
  }
  await hostContext.close();

  console.log(`browser issues=${JSON.stringify(issues)}`);
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
