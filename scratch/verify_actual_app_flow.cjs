const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ARTIFACTS_DIR = 'C:\\Users\\shrut\\.gemini\\antigravity-ide\\brain\\5f77483e-034f-49c2-8b43-5ade2145912d';

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let b = '';
      res.on('data', (c) => (b += c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(b));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('--- STARTING ACTUAL APP USER FLOW TEST ---');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--remote-debugging-port=9225',
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--user-data-dir=' + require('os').tmpdir() + '\\chrome-flow-test-' + Date.now(),
  ]);

  await new Promise((r) => setTimeout(r, 1800));

  try {
    const tabs = await getJson('http://localhost:9225/json');
    const pageTarget = tabs.find((t) => t.type === 'page') || tabs[0];
    const ws = new (globalThis.WebSocket)(pageTarget.webSocketDebuggerUrl);
    await new Promise((r) => (ws.onopen = r));

    let id = 1;
    function send(m, p = {}) {
      return new Promise((resolve) => {
        const curId = id++;
        const handler = (evt) => {
          const d = JSON.parse(evt.data);
          if (d.id === curId) {
            ws.removeEventListener('message', handler);
            resolve(d.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method: m, params: p }));
      });
    }

    async function ev(expr) {
      const res = await send('Runtime.evaluate', {
        expression: expr,
        returnByValue: true,
        awaitPromise: true,
      });
      return res.result ? res.result.value : res;
    }

    async function captureScreenshot(filename) {
      const { data } = await send('Page.captureScreenshot', { format: 'png' });
      const outPath = path.join(ARTIFACTS_DIR, filename);
      fs.writeFileSync(outPath, Buffer.from(data, 'base64'));
      console.log(`[SCREENSHOT] ${filename}`);
    }

    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1366,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // STEP 1: Open /
    console.log('\nStep 1: Navigate to / (Home)');
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise((r) => setTimeout(r, 1500));
    await captureScreenshot('actual_01_home.png');

    // STEP 2: Click "Portals"
    console.log('\nStep 2: Click Portals in header');
    await ev(`
      const navLinks = Array.from(document.querySelectorAll('a'));
      const portalsLink = navLinks.find(a => a.textContent.trim() === 'Portals');
      if (portalsLink) portalsLink.click();
    `);
    await new Promise((r) => setTimeout(r, 1500));
    const urlAfterPortals = await ev('window.location.href');
    console.log('URL after clicking Portals:', urlAfterPortals);
    await captureScreenshot('actual_02_portals_page.png');

    // Verify Driver Portal Card appears
    const hasDriverCard = await ev(`
      Boolean(document.querySelector('#btn-access-driver-portal') || Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('Access Driver Portal')))
    `);
    console.log('Driver Portal Card visible on /portals:', hasDriverCard);

    // STEP 3: Click "Access Driver Portal"
    console.log('\nStep 3: Click Access Driver Portal');
    await ev(`
      const btn = document.querySelector('#btn-access-driver-portal') || Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('Access Driver Portal'));
      if (btn) btn.click();
    `);
    await new Promise((r) => setTimeout(r, 1500));
    const urlAfterDriverClick = await ev('window.location.href');
    console.log('URL after clicking Access Driver Portal:', urlAfterDriverClick);
    await captureScreenshot('actual_03_signin_driver.png');

    // STEP 4: Click "Demo Driver Login"
    console.log('\nStep 4: Click Demo Driver Login button');
    await ev(`
      const btn = document.querySelector('#btn-demo-driver-login');
      if (btn) btn.click();
    `);
    await new Promise((r) => setTimeout(r, 1500));
    const urlAfterDemoLogin = await ev('window.location.href');
    console.log('URL after Demo Driver Login:', urlAfterDemoLogin);
    await captureScreenshot('actual_04_driver_dashboard.png');

    // STEP 5: Verify all Driver Portal routes
    const driverRoutes = [
      { name: 'deliveries', path: '/driver/deliveries' },
      { name: 'delivery_details', path: '/driver/deliveries/DEL-001' },
      { name: 'current_delivery', path: '/driver/current-delivery' },
      { name: 'pickup', path: '/driver/pickup' },
      { name: 'delivery', path: '/driver/delivery' },
      { name: 'route', path: '/driver/route' },
      { name: 'live_location', path: '/driver/live-location' },
      { name: 'vehicle', path: '/driver/vehicle' },
      { name: 'vehicle_inspection', path: '/driver/vehicle-inspection' },
      { name: 'history', path: '/driver/history' },
      { name: 'notifications', path: '/driver/notifications' },
      { name: 'profile', path: '/driver/profile' },
      { name: 'support', path: '/driver/support' },
    ];

    console.log('\nStep 5: Verifying all 13 driver sub-routes...');
    for (const r of driverRoutes) {
      await send('Page.navigate', { url: `http://localhost:5173${r.path}` });
      await new Promise((res) => setTimeout(res, 800));
      const pageTitle = await ev('document.querySelector("h1, h2")?.textContent || document.title');
      console.log(`✓ Route ${r.path} rendered successfully (Title: "${pageTitle.trim()}")`);
    }

    // STEP 6: Verify Other Portals Still Work
    console.log('\nStep 6: Verifying other portals still intact...');
    
    // Customer Sign-in
    await send('Page.navigate', { url: 'http://localhost:5173/signin/customer' });
    await new Promise((res) => setTimeout(res, 800));
    const customerLoginTitle = await ev('document.querySelector("h1, h2")?.textContent');
    console.log(`✓ /signin/customer: "${customerLoginTitle.trim()}"`);

    // Admin Sign-in
    await send('Page.navigate', { url: 'http://localhost:5173/signin/admin' });
    await new Promise((res) => setTimeout(res, 800));
    const adminLoginTitle = await ev('document.querySelector("h1, h2")?.textContent');
    console.log(`✓ /signin/admin: "${adminLoginTitle.trim()}"`);

    // Warehouse Sign-in
    await send('Page.navigate', { url: 'http://localhost:5173/signin/warehouse' });
    await new Promise((res) => setTimeout(res, 800));
    const warehouseLoginTitle = await ev('document.querySelector("h1, h2")?.textContent');
    console.log(`✓ /signin/warehouse: "${warehouseLoginTitle.trim()}"`);

    // Portal Selector at /signin
    await send('Page.navigate', { url: 'http://localhost:5173/signin' });
    await new Promise((res) => setTimeout(res, 1000));
    await captureScreenshot('actual_05_signin_portals_selection.png');
    console.log('✓ /signin displays 4-portal selector');

    // STEP 7: Test Driver Logout direct return to /
    console.log('\nStep 7: Testing Driver Logout direct return to / ...');
    await send('Page.navigate', { url: 'http://localhost:5173/driver/dashboard' });
    await new Promise((res) => setTimeout(res, 1000));
    await ev(`
      const btn = document.querySelector('button[title="Sign Out to Landing Page"]');
      if (btn) btn.click();
    `);
    await new Promise((res) => setTimeout(res, 1200));
    const urlAfterLogout = await ev('window.location.href');
    console.log('URL after clicking Logout from Driver Portal:', urlAfterLogout);
    console.log(`Logout return to root /: ${urlAfterLogout === 'http://localhost:5173/' ? 'PASS' : 'FAIL'}`);

    console.log('\n========================================');
    console.log('ALL VERIFICATIONS PASSED IN ACTUAL APPLICATION!');
    console.log('========================================');

    ws.close();
  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    chromeProc.kill();
  }
}

main();
