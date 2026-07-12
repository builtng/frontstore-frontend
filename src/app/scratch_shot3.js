const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  await page.goto('http://localhost:3001/business', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(3000);
  const height = await page.evaluate(() => document.body.scrollHeight);
  console.log('scrollHeight', height);
  // scroll through to trigger any lazy stuff
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 30));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);
  const height2 = await page.evaluate(() => document.body.scrollHeight);
  console.log('scrollHeight after scroll', height2);
  await page.screenshot({ path: '/private/tmp/claude-501/-Users-mac-Desktop-frontstore/56c397d6-ddf7-4a11-997f-42c10fc51a94/scratchpad/business_full2.png', fullPage: true });
  await browser.close();
})();
