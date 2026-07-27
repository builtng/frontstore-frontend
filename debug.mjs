import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('http://localhost:3000/frontstore/products/test-lightbox-product', { waitUntil: 'networkidle' });
const info = await page.evaluate(() => {
  const img = document.querySelector('.fs-hero img');
  const cs = getComputedStyle(img);
  return {
    src: img.src,
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
    inlineStyle: img.getAttribute('style'),
    computedObjectFit: cs.objectFit,
    boundingRect: img.getBoundingClientRect(),
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
