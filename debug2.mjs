import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('http://localhost:3000/frontstore/products/test-lightbox-product', { waitUntil: 'networkidle' });
const info = await page.evaluate(() => {
  const hero = document.querySelector('.fs-hero');
  const cs = getComputedStyle(hero);
  return {
    height: cs.height,
    inlineStyle: hero.getAttribute('style'),
    className: hero.className,
    rect: hero.getBoundingClientRect(),
    parentClass: hero.parentElement.className,
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
