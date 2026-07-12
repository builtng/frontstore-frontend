const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push('CONSOLE: ' + msg.text()); });
  await page.goto('http://localhost:3001/business', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  const bodyText = await page.innerText('body');
  require('fs').writeFileSync('/tmp/business_bodytext.txt', bodyText);
  console.log('ERRORS:', JSON.stringify(errors, null, 2));
  console.log('TEXT LENGTH', bodyText.length);
  await browser.close();
})();
