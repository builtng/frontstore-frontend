import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('http://localhost:3000/frontstore/products/test-lightbox-product', { waitUntil: 'networkidle' });
const info = await page.evaluate(() => {
  const img = document.querySelector('.fs-hero img');
  const cs = getComputedStyle(img);
  return {
    height: cs.height,
    width: cs.width,
    maxWidth: cs.maxWidth,
    boxSizing: cs.boxSizing,
    display: cs.display,
    aspectRatio: cs.aspectRatio,
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
