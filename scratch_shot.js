const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  await page.goto('http://localhost:3001/business', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/private/tmp/claude-501/-Users-mac-Desktop-frontstore/56c397d6-ddf7-4a11-997f-42c10fc51a94/scratchpad/business_full.png', fullPage: true });
  const bodyText = await page.innerText('body');
  console.log('HAS_BACK_OFFICE', bodyText.includes('back office'));
  console.log('HAS_OPERATIONS', bodyText.includes('Business Operations'));
  await browser.close();
})();
