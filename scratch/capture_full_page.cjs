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
        try { resolve(JSON.parse(b)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function captureFullPage() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--remote-debugging-port=9227',
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--user-data-dir=' + require('os').tmpdir() + '\\chrome-driver-full-' + Date.now(),
  ]);

  await new Promise((r) => setTimeout(r, 2000));

  try {
    const tabs = await getJson('http://localhost:9227/json');
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

    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 1400,
      deviceScaleFactor: 1,
      mobile: false,
    });

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

    await send('Page.navigate', { url: 'http://localhost:5173/driver/route' });
    await new Promise((r) => setTimeout(r, 2500));

    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'driver_route_fullpage_verified.png'), Buffer.from(data, 'base64'));
    console.log('Saved driver_route_fullpage_verified.png');

    ws.close();
  } catch (err) {
    console.error('Failed to capture full page:', err);
  } finally {
    chromeProc.kill();
  }
}

captureFullPage();
