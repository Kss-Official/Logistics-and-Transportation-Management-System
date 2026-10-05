const puppeteer = require('puppeteer');

async function testPortals() {
  console.log('--- Starting Comprehensive Multi-Portal Runtime Verification ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleLogs = [];
  const errors = [];
  const failedRequests = [];

  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    consoleLogs.push({ type, text });
    if (
      text.includes('Maximum update depth exceeded') ||
      text.includes('React has detected a change in the order of Hooks') ||
      text.includes('Should have a queue') ||
      text.includes('The final argument passed to useEffect changed size') ||
      text.includes('Uncaught')
    ) {
      errors.push(`[Console ${type.toUpperCase()}] ${text}`);
      console.error(`🚨 CRITICAL CONSOLE ERROR: ${text}`);
    }
  });

  page.on('pageerror', err => {
    errors.push(`[PageError] ${err.message}`);
    console.error(`🚨 UNCAUGHT PAGE ERROR: ${err.message}`);
  });

  page.on('requestfailed', req => {
    failedRequests.push({ url: req.url(), method: req.method(), errorText: req.failure()?.errorText });
  });

  page.on('response', res => {
    const url = res.url();
    const status = res.status();
    if (status >= 400) {
      if (url.includes('/api/customer/notifications') || url.includes('/api/customer/notifications/unread-count')) {
        errors.push(`[403 FORBIDDEN NOTIF] ${res.request().method()} ${url} -> ${status}`);
        console.error(`🚨 UNEXPECTED NOTIFICATION REQUEST: ${url} returned ${status}`);
      }
    }
  });

  // ── TEST 1: WAREHOUSE MANAGER PORTAL (/warehouse/live-map) ──
  console.log('\n[1/3] Testing Warehouse Manager Portal...');
  await page.goto('http://localhost:5173/signin/warehouse', { waitUntil: 'networkidle2' });
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'priya@primeroute.com');
  await page.type('input[type="password"]', 'Manager@2026!');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
  await new Promise(r => setTimeout(r, 1500));

  console.log('Navigating to /warehouse/live-map...');
  await page.goto('http://localhost:5173/warehouse/live-map', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const warehouseRoutes = [
    '/warehouse/dashboard',
    '/warehouse/orders',
    '/warehouse/inventory',
    '/warehouse/outgoing',
    '/warehouse/dispatch',
    '/warehouse/live-map',
    '/warehouse/profile'
  ];

  for (const route of warehouseRoutes) {
    console.log(`Checking Warehouse Route: ${route}`);
    await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));
  }

  // ── TEST 2: DRIVER PORTAL ──
  console.log('\n[2/3] Testing Driver Portal...');
  await page.goto('http://localhost:5173/signin/driver', { waitUntil: 'networkidle2' });
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'ramesh@primeroute.com');
  await page.type('input[type="password"]', 'Driver@2026!');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
  await new Promise(r => setTimeout(r, 1500));

  const driverRoutes = [
    '/driver/dashboard',
    '/driver/deliveries',
    '/driver/current-delivery',
    '/driver/pickup',
    '/driver/route',
    '/driver/live-location',
    '/driver/vehicle',
    '/driver/history',
    '/driver/profile'
  ];

  for (const route of driverRoutes) {
    console.log(`Checking Driver Route: ${route}`);
    await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));
  }

  // ── TEST 3: CUSTOMER PORTAL ──
  console.log('\n[3/3] Testing Customer Portal...');
  await page.goto('http://localhost:5173/signin/customer', { waitUntil: 'networkidle2' });
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'shrutisanjanasahoo@gmail.com');
  await page.type('input[type="password"]', 'Customer@2026!');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
  await new Promise(r => setTimeout(r, 1500));

  console.log('Checking Customer Dashboard & Notifications...');
  await page.goto('http://localhost:5173/customer/dashboard', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.goto('http://localhost:5173/customer/notifications', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  await browser.close();

  console.log('\n================ VERIFICATION SUMMARY ================');
  console.log(`Total Critical React/Hook/Network Errors: ${errors.length}`);
  if (errors.length > 0) {
    console.error('Errors encountered:');
    errors.forEach(e => console.error(` - ${e}`));
    process.exit(1);
  } else {
    console.log('✅ ALL PORTAL ROUTES VERIFIED WITH ZERO REACT HOOK ERRORS, ZERO UPDATE LOOPS, AND ZERO 403 NOTIFICATION ERRORS!');
    process.exit(0);
  }
}

testPortals().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
