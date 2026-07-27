import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('http://localhost:3000/frontstore/products/test-lightbox-product', { waitUntil: 'networkidle' });
await page.waitForSelector('.fs-hero img');
await page.screenshot({ path: '/private/tmp/claude-501/-Users-mac-Desktop-frontstore/224db4ee-4944-4638-a0bf-6b06cbe9bd59/scratchpad/1-gallery.png' });

await page.click('.fs-expand-btn');
await page.waitForSelector('[role="dialog"]');
await page.waitForTimeout(300);
await page.screenshot({ path: '/private/tmp/claude-501/-Users-mac-Desktop-frontstore/224db4ee-4944-4638-a0bf-6b06cbe9bd59/scratchpad/2-lightbox.png' });

const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

await browser.close();
console.log('done', errors);
