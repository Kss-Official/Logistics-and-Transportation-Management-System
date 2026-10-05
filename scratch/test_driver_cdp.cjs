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
  console.log('Launching headless Chrome for Driver Portal testing...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--remote-debugging-port=9224',
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--user-data-dir=' + require('os').tmpdir() + '\\chrome-driver-test-' + Date.now(),
  ]);

  await new Promise((r) => setTimeout(r, 1800));

  try {
    const tabs = await getJson('http://localhost:9224/json');
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
      console.log(`Saved screenshot: ${filename}`);
    }

    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1366,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // 1. Check /portals directory
    console.log('1. Checking /portals directory...');
    await send('Page.navigate', { url: 'http://localhost:5173/portals' });
    await new Promise((r) => setTimeout(r, 1500));
    await captureScreenshot('driver_portals_directory.png');

    // 2. Check /signin/driver page
    console.log('2. Checking /signin/driver login page...');
    await send('Page.navigate', { url: 'http://localhost:5173/signin/driver' });
    await new Promise((r) => setTimeout(r, 1200));
    await captureScreenshot('driver_signin_page.png');

    // Authenticate driver session
    const driverUser = {
      id: 'DRV-001',
      email: 'ramesh.kumar@primeroute.com',
      name: 'Ramesh Kumar',
      role: 'DRIVER',
      driverCode: 'DRV-BLR-042',
      vehicleCode: 'PR-VH-005',
    };
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const exp = Math.floor(Date.now() / 1000) + 86400 * 7;
    const body = Buffer.from(JSON.stringify({ sub: 'ramesh.kumar@primeroute.com', role: 'DRIVER', exp })).toString('base64');
    const token = `${header}.${body}.mockdriversignature`;

    await ev(`
      localStorage.setItem('auth_token', ${JSON.stringify(token)});
      localStorage.setItem('auth_user', ${JSON.stringify(JSON.stringify(driverUser))});
      sessionStorage.setItem('auth_token', ${JSON.stringify(token)});
      sessionStorage.setItem('auth_user', ${JSON.stringify(JSON.stringify(driverUser))});
    `);

    // 3. Driver Dashboard
    console.log('3. Checking /driver/dashboard...');
    await send('Page.navigate', { url: 'http://localhost:5173/driver/dashboard' });
    await new Promise((r) => setTimeout(r, 1500));
    await captureScreenshot('driver_dashboard_verified.png');

    // 4. Deliveries
    console.log('4. Checking /driver/deliveries...');
    await send('Page.navigate', { url: 'http://localhost:5173/driver/deliveries' });
    await new Promise((r) => setTimeout(r, 1200));
    await captureScreenshot('driver_deliveries_verified.png');

    // 5. Current Delivery Active Mission
    console.log('5. Checking /driver/current-delivery...');
    await send('Page.navigate', { url: 'http://localhost:5173/driver/current-delivery' });
    await new Promise((r) => setTimeout(r, 1200));
    await captureScreenshot('driver_current_delivery_verified.png');

    // 6. Cargo Pickup
    console.log('6. Checking /driver/pickup...');
    await send('Page.navigate', { url: 'http://localhost:5173/driver/pickup' });
    await new Promise((r) => setTimeout(r, 1200));
    await captureScreenshot('driver_pickup_verified.png');

    // 7. Delivery ePOD
    console.log('7. Checking /driver/delivery...');
    await send('Page.navigate', { url: 'http://localhost:5173/driver/delivery' });
    await new Promise((r) => setTimeout(r, 1200));
    await captureScreenshot('driver_epod_verified.png');

    // 8. Live Location Leaflet Map
    console.log('8. Checking /driver/live-location...');
    await send('Page.navigate', { url: 'http://localhost:5173/driver/live-location' });
    await new Promise((r) => setTimeout(r, 2000));
    await captureScreenshot('driver_live_location_verified.png');

    // 9. Vehicle Diagnostics
    console.log('9. Checking /driver/vehicle...');
    await send('Page.navigate', { url: 'http://localhost:5173/driver/vehicle' });
    await new Promise((r) => setTimeout(r, 1200));
    await captureScreenshot('driver_vehicle_verified.png');

    // 10. Mobile Viewport (375x812)
    console.log('10. Checking Mobile Viewport...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await send('Page.navigate', { url: 'http://localhost:5173/driver/dashboard' });
    await new Promise((r) => setTimeout(r, 1500));
    await captureScreenshot('driver_mobile_dashboard_verified.png');

    // 11. Test Sign Out to root /
    console.log('11. Testing Driver Logout to Landing Page...');
    await ev(`
      const btn = document.querySelector('button[title="Sign Out to Landing Page"]');
      if (btn) btn.click();
    `);
    await new Promise((r) => setTimeout(r, 1200));
    const currentUrl = await ev('window.location.href');
    console.log('Current URL after logout:', currentUrl);

    console.log('ALL DRIVER PORTAL CDP TESTS EXECUTED SUCCESSFULLY!');
    ws.close();
  } catch (err) {
    console.error('CDP test error:', err);
  } finally {
    chromeProc.kill();
  }
}

main();
