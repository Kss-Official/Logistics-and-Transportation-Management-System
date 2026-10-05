const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/shrut/.gemini/antigravity-ide/brain/9b776dcb-8671-460f-8588-2783a1ebf6ba';

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('--- 1. Login as Kolkata Warehouse Manager ---');
  await page.goto('http://localhost:5173/warehouse/login', { waitUntil: 'networkidle2' });

  await page.type('input[type="email"]', 'ccu.east@primeroute.com');
  await page.type('input[type="password"]', 'Manager@2026!');
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
  await new Promise(r => setTimeout(r, 2000));

  console.log('Navigating to Warehouse Orders...');
  await page.goto('http://localhost:5173/warehouse/orders', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const kolkataOrdersScreenshot = path.join(ARTIFACT_DIR, 'kolkata_manager_orders_verified.png');
  await page.screenshot({ path: kolkataOrdersScreenshot, fullPage: true });
  console.log('Saved screenshot:', kolkataOrdersScreenshot);

  const pageContent = await page.content();
  const hasRemediatedOrder = pageContent.includes('PR-ORD-76406402');
  console.log(`Kolkata Manager UI displays PR-ORD-76406402: ${hasRemediatedOrder ? 'YES (Verified)' : 'NO'}`);

  console.log('\n--- 2. Login as Bengaluru Warehouse Manager ---');
  await page.goto('http://localhost:5173/warehouse/login', { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:5173/warehouse/login', { waitUntil: 'networkidle2' });

  await page.type('input[type="email"]', 'priya@primeroute.com');
  await page.type('input[type="password"]', 'Manager@2026!');
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
  await new Promise(r => setTimeout(r, 2000));

  await page.goto('http://localhost:5173/warehouse/orders', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const blrOrdersScreenshot = path.join(ARTIFACT_DIR, 'blr_manager_orders_verified.png');
  await page.screenshot({ path: blrOrdersScreenshot, fullPage: true });
  console.log('Saved screenshot:', blrOrdersScreenshot);

  const blrPageContent = await page.content();
  const blrHasRemediatedOrder = blrPageContent.includes('PR-ORD-76406402');
  console.log(`Bengaluru Manager UI displays PR-ORD-76406402: ${blrHasRemediatedOrder ? 'YES (WRONG)' : 'NO (Properly Excluded)'}`);

  await browser.close();
}

main().catch(err => {
  console.error('Browser check failed:', err);
  process.exit(1);
});
