const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

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

function apiLogin(email, password) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, password });
    const req = http.request(
      {
        hostname: 'localhost',
        port: 8080,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let b = '';
        res.on('data', (c) => (b += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(b));
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const loginRes = await apiLogin('priya@primeroute.com', 'Manager@2026!');
  const token = loginRes.token;
  const user = {
    id: String(loginRes.id || 1),
    email: loginRes.email,
    name: loginRes.fullName,
    fullName: loginRes.fullName,
    initials: 'PS',
    role: 'WAREHOUSE_MANAGER',
    roleTitle: 'Warehouse Manager',
    warehouseId: loginRes.warehouseId,
    warehouseCode: loginRes.warehouseCode,
    warehouseName: loginRes.warehouseName,
  };

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9224',
    '--no-sandbox',
    '--disable-gpu',
    '--user-data-dir=' + require('os').tmpdir() + '\\chrome-temp-' + Date.now(),
  ]);

  await new Promise((r) => setTimeout(r, 1500));

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

  await send('Page.enable');

  // Test at 1366px (user exact screen in screenshot)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await send('Page.navigate', { url: 'http://localhost:5173/' });
  await new Promise((r) => setTimeout(r, 1200));

  const u = JSON.stringify(JSON.stringify(user));
  const t = JSON.stringify(token);
  await ev(`
    localStorage.setItem('auth_token', ${t});
    localStorage.setItem('auth_user', ${u});
    sessionStorage.setItem('auth_token', ${t});
    sessionStorage.setItem('auth_user', ${u});
    localStorage.setItem('token', ${t});
    localStorage.setItem('user', ${u});
  `);

  await send('Page.navigate', { url: 'http://localhost:5173/warehouse/incoming' });
  await new Promise((r) => setTimeout(r, 2000));

  const metrics = await ev(`
    (() => {
      const table = document.querySelector('table');
      const container = table ? table.parentElement : null;
      const card = table ? table.closest('div[style*=\"border-radius\"], div[style*=\"borderRadius\"]') : null;
      const ths = Array.from(document.querySelectorAll('th')).map(th => ({
        text: th.textContent.trim(),
        width: Math.round(th.getBoundingClientRect().width)
      }));
      const actionsCell = document.querySelector('.wh-actions-cell');
      const actionBtn = actionsCell ? actionsCell.querySelector('button') : null;
      const actionBtnRect = actionBtn ? actionBtn.getBoundingClientRect() : null;
      const containerRect = container ? container.getBoundingClientRect() : null;

      return {
        tableWidth: table ? Math.round(table.getBoundingClientRect().width) : null,
        containerClientWidth: container ? container.clientWidth : null,
        containerScrollWidth: container ? container.scrollWidth : null,
        hasHorizontalScroll: container ? container.scrollWidth > container.clientWidth : false,
        cardWidth: card ? Math.round(card.getBoundingClientRect().width) : null,
        ths,
        actionBtnRect: actionBtnRect ? {
          left: Math.round(actionBtnRect.left),
          right: Math.round(actionBtnRect.right),
          width: Math.round(actionBtnRect.width),
          height: Math.round(actionBtnRect.height)
        } : null,
        containerRight: containerRect ? Math.round(containerRect.right) : null,
        btnFullyVisible: actionBtnRect && containerRect ? actionBtnRect.right <= containerRect.right : false
      };
    })()
  `);

  console.log('=== METRICS AT 1280px VIEWPORT ===');
  console.log(JSON.stringify(metrics, null, 2));

  // Capture screenshot
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const shotPath = path.join(__dirname, 'incoming_fixed.png');
  fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
  console.log('Screenshot saved to:', shotPath);

  ws.close();
  chromeProc.kill();
}

main().catch(console.error);
