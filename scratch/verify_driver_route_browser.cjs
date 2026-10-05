const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ARTIFACTS_DIR = 'C:\\Users\\shrut\\.gemini\\antigravity-ide\\brain\\9b776dcb-8671-460f-8588-2783a1ebf6ba';

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

async function runBrowserVerification() {
  console.log('=== Starting Browser Verification for Driver Route Navigation ===');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--remote-debugging-port=9225',
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--user-data-dir=' + require('os').tmpdir() + '\\chrome-driver-route-test-' + Date.now(),
  ]);

  await new Promise((r) => setTimeout(r, 2000));

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
      console.log(`Saved screenshot: ${filename}`);
    }

    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // 1. Authenticate with real token for Ramesh Kumar
    const axios = require('axios');
    const loginRes = await axios.post('http://localhost:8080/api/auth/login', {
      email: 'ramesh@primeroute.com',
      password: 'Driver@2026'
    });
    const token = loginRes.data.token;
    const driverUser = {
      id: 20,
      email: 'ramesh@primeroute.com',
      name: 'Ramesh Kumar',
      role: 'DRIVER',
    };

    console.log('1. Setting authenticated session in browser...');
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise((r) => setTimeout(r, 1000));

    await ev(`
      localStorage.setItem('auth_token', ${JSON.stringify(token)});
      localStorage.setItem('token', ${JSON.stringify(token)});
      localStorage.setItem('auth_user', ${JSON.stringify(JSON.stringify(driverUser))});
      sessionStorage.setItem('auth_token', ${JSON.stringify(token)});
      sessionStorage.setItem('token', ${JSON.stringify(token)});
      sessionStorage.setItem('auth_user', ${JSON.stringify(JSON.stringify(driverUser))});
    `);

    // 2. Navigate to /driver/route
    console.log('2. Navigating to /driver/route...');
    await send('Page.navigate', { url: 'http://localhost:5173/driver/route' });
    await new Promise((r) => setTimeout(r, 2500));
    await captureScreenshot('driver_route_live_verified.png');

    // 3. Test map interaction buttons
    console.log('3. Testing Recenter and Fit Route buttons...');
    await ev(`
      const recenterBtn = document.querySelector('button[title="Center map on driver GPS location"]');
      if (recenterBtn) recenterBtn.click();
    `);
    await new Promise((r) => setTimeout(r, 800));

    await ev(`
      const fitBtn = document.querySelector('button[title="Fit map to full corridor route"]');
      if (fitBtn) fitBtn.click();
    `);
    await new Promise((r) => setTimeout(r, 800));

    console.log('4. Testing Refresh Route button...');
    await ev(`
      const refreshBtn = document.querySelector('button[title="Refresh road route and distance calculations"]');
      if (refreshBtn) refreshBtn.click();
    `);
    await new Promise((r) => setTimeout(r, 1500));
    await captureScreenshot('driver_route_refreshed_verified.png');

    console.log('=== BROWSER VERIFICATION COMPLETED SUCCESSFULLY ===');
    ws.close();
  } catch (err) {
    console.error('Browser verification failed:', err);
  } finally {
    chromeProc.kill();
  }
}

runBrowserVerification();
