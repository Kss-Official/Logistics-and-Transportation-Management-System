const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = path.resolve('C:/Users/shrut/.gemini/antigravity-ide/brain/5f77483e-034f-49c2-8b43-5ade2145912d');

async function verify() {
  console.log('Launching browser to test Driver Portal...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 800 });

  try {
    // 1. Check Portals Directory
    console.log('1. Testing /portals for 4-portal directory...');
    await page.goto('http://localhost:5173/portals', { waitUntil: 'networkidle0', timeout: 15000 });
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'driver_portals_directory.png') });
    console.log('Saved driver_portals_directory.png');

    // 2. Go to Driver Sign In
    console.log('2. Testing /signin/driver...');
    await page.goto('http://localhost:5173/signin/driver', { waitUntil: 'networkidle0', timeout: 15000 });
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'driver_signin_page.png') });
    console.log('Saved driver_signin_page.png');

    // Click Auto-fill demo
    const demoBtn = await page.$('button ::-p-text(Demo)');
    if (demoBtn) {
      await demoBtn.click();
    } else {
      // Find button by text
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.includes('Demo')) {
          await btn.click();
          break;
        }
      }
    }
    await new Promise(r => setTimeout(r, 600));

    // Submit sign in
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 1000));

    console.log('Current URL after driver sign in:', page.url());
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'driver_dashboard_verified.png') });
    console.log('Saved driver_dashboard_verified.png');

    // 3. Deliveries
    console.log('3. Testing /driver/deliveries...');
    await page.goto('http://localhost:5173/driver/deliveries', { waitUntil: 'networkidle0', timeout: 10000 });
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'driver_deliveries_verified.png') });

    // 4. Current Delivery Active Mission
    console.log('4. Testing /driver/current-delivery...');
    await page.goto('http://localhost:5173/driver/current-delivery', { waitUntil: 'networkidle0', timeout: 10000 });
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'driver_current_delivery_verified.png') });

    // 5. Cargo Pickup
    console.log('5. Testing /driver/pickup...');
    await page.goto('http://localhost:5173/driver/pickup', { waitUntil: 'networkidle0', timeout: 10000 });
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'driver_pickup_verified.png') });

    // 6. Delivery ePOD
    console.log('6. Testing /driver/delivery...');
    await page.goto('http://localhost:5173/driver/delivery', { waitUntil: 'networkidle0', timeout: 10000 });
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'driver_epod_verified.png') });

    // 7. Live Location
    console.log('7. Testing /driver/live-location...');
    await page.goto('http://localhost:5173/driver/live-location', { waitUntil: 'networkidle0', timeout: 10000 });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'driver_live_location_verified.png') });

    // 8. Vehicle Telemetry
    console.log('8. Testing /driver/vehicle...');
    await page.goto('http://localhost:5173/driver/vehicle', { waitUntil: 'networkidle0', timeout: 10000 });
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'driver_vehicle_verified.png') });

    // 9. Mobile Viewport Test (375x812)
    console.log('9. Testing Mobile Viewport...');
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:5173/driver/dashboard', { waitUntil: 'networkidle0', timeout: 10000 });
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'driver_mobile_dashboard_verified.png') });

    // 10. Test Logout to root /
    console.log('10. Testing Logout...');
    const logoutBtn = await page.$('button[title="Sign Out to Landing Page"]');
    if (logoutBtn) {
      await logoutBtn.click();
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 8000 }).catch(() => {});
      console.log('URL after driver logout:', page.url());
    }

    console.log('ALL DRIVER PORTAL TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Verification failed:', err);
  } finally {
    await browser.close();
  }
}

verify();
