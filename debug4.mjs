import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('http://localhost:3000/frontstore/products/test-lightbox-product', { waitUntil: 'networkidle' });

// Test A: current (contain)
let a = await page.evaluate(() => {
  const img = document.querySelector('.fs-hero img');
  return { objectFit: getComputedStyle(img).objectFit, h: img.getBoundingClientRect().height };
});
console.log('A (as-is):', JSON.stringify(a));

// Test B: force object-fit cover via JS, keep everything else
await page.evaluate(() => {
  const img = document.querySelector('.fs-hero img');
  img.style.objectFit = 'cover';
});
let b = await page.evaluate(() => {
  const img = document.querySelector('.fs-hero img');
  return { objectFit: getComputedStyle(img).objectFit, h: img.getBoundingClientRect().height };
});
console.log('B (forced cover):', JSON.stringify(b));

// Test C: force position:absolute inset:0 with contain (common fix pattern)
await page.evaluate(() => {
  const img = document.querySelector('.fs-hero img');
  img.style.objectFit = 'contain';
  img.style.position = 'absolute';
  img.style.inset = '0';
});
let c = await page.evaluate(() => {
  const img = document.querySelector('.fs-hero img');
  return { objectFit: getComputedStyle(img).objectFit, position: getComputedStyle(img).position, h: img.getBoundingClientRect().height, w: img.getBoundingClientRect().width };
});
console.log('C (contain + absolute inset:0):', JSON.stringify(c));

await browser.close();
