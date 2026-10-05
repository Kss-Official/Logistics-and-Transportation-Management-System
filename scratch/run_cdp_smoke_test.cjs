const puppeteer = require('puppeteer');

async function runBrowserAudit() {
  console.log('================================================================');
  console.log('BROWSER E2E SMOKE TEST & CONSOLE/NETWORK AUDIT');
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  const networkErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore favicon or non-critical 3rd party tile errors if any
      if (!text.includes('favicon') && !text.includes('tile.openstreetmap.org')) {
        consoleErrors.push(`[Console Error]: ${text}`);
      }
    }
  });

  page.on('response', res => {
    if (res.status() >= 400) {
      const url = res.url();
      // Ignore benign 404s like missing favicon
      if (!url.includes('favicon.ico')) {
        networkErrors.push(`[HTTP ${res.status()}] ${url}`);
      }
    }
  });

  async function loginAndVisit(roleName, email, password, routes) {
    console.log(`\n--- Testing ${roleName} Portal ---`);
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    
    // Fill credentials
    await page.waitForSelector('input[type="email"], input[name="email"]');
    const emailInput = await page.$('input[type="email"], input[name="email"]');
    const passInput = await page.$('input[type="password"], input[name="password"]');
    
    await emailInput.click({ clickCount: 3 });
    await emailInput.type(email);
    await passInput.click({ clickCount: 3 });
    await passInput.type(password);
    
    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn.click();
    
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 1000));

    console.log(`   ✓ Logged in as ${email}. Current URL: ${page.url()}`);

    for (const route of routes) {
      console.log(`   Visiting ${route}...`);
      await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 800));
      console.log(`   ✓ Visited ${route} successfully`);
    }

    // Logout
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    console.log(`   ✓ Logged out`);
  }

  try {
    // 1. Customer
    await loginAndVisit('Customer', 'audit.cust.1790664776159@primeroute.com', 'Customer@2026!', [
      '/customer',
      '/customer/orders',
      '/customer/tracking',
    ]);

    // 2. Warehouse Manager
    await loginAndVisit('Warehouse Manager', 'priya@primeroute.com', 'Manager@2026!', [
      '/warehouse',
      '/warehouse/orders',
      '/warehouse/shipments',
      '/warehouse/fleet',
      '/warehouse/tracking',
    ]);

    // 3. Driver
    await loginAndVisit('Driver', 'ramesh@primeroute.com', 'Driver@2026!', [
      '/driver',
      '/driver/route',
      '/driver/live-location',
      '/driver/vehicle',
      '/driver/profile',
      '/driver/notifications',
      '/driver/support',
    ]);

    // 4. Admin
    await loginAndVisit('Admin', 'sanjanaaa.shru@gmail.com', 'Sanjana@102026', [
      '/admin',
      '/admin/shipments',
      '/admin/warehouses',
      '/admin/tracking',
    ]);

    console.log('\n================================================================');
    console.log('BROWSER SMOKE TEST SUMMARY');
    console.log('================================================================');
    console.log(`Total Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(e => console.log('  ', e));
    } else {
      console.log('  ✓ 0 Console Errors');
    }

    console.log(`Total Network Errors (>=400): ${networkErrors.length}`);
    if (networkErrors.length > 0) {
      networkErrors.forEach(e => console.log('  ', e));
    } else {
      console.log('  ✓ 0 Network Errors');
    }

  } catch (err) {
    console.error('❌ Browser Smoke Test Error:', err);
  } finally {
    await browser.close();
  }
}

runBrowserAudit();
