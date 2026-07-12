const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 4244 } });
  await page.goto('http://localhost:3001/business', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/private/tmp/claude-501/-Users-mac-Desktop-frontstore/56c397d6-ddf7-4a11-997f-42c10fc51a94/scratchpad/business_full3.png' });
  await browser.close();
})();
