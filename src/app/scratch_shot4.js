const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  await page.goto('http://localhost:3001/business', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(1500);
  const sections = await page.$$eval('header, section, footer', els => els.map(el => {
    const r = el.getBoundingClientRect();
    return { tag: el.tagName, top: r.top + window.scrollY, height: r.height, text: el.innerText.slice(0,40).replace(/\n/g,' ') };
  }));
  console.log(JSON.stringify(sections, null, 2));
  await browser.close();
})();
