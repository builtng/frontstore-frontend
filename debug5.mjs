import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('http://localhost:3000/frontstore/products/test-lightbox-product', { waitUntil: 'networkidle' });
const info = await page.evaluate(() => {
  const img = document.querySelector('.fs-thumb img');
  return { rect: img.getBoundingClientRect(), objectFit: getComputedStyle(img).objectFit };
});
console.log(JSON.stringify(info));
await browser.close();
