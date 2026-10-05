const http = require('http');
const { spawn } = require('child_process');

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
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--remote-debugging-port=9222',
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--user-data-dir=' + require('os').tmpdir() + '\\chrome-temp-' + Date.now(),
  ]);

  await new Promise((r) => setTimeout(r, 1200));

  const tabs = await getJson('http://localhost:9222/json');
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
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await send('Page.navigate', { url: 'http://localhost:5173/' });
  await new Promise((r) => setTimeout(r, 1200));

  const user = {
    id: 999,
    email: 'priya@primeroute.com',
    fullName: 'Priya Sharma',
    role: 'ROLE_WAREHOUSE_MANAGER',
    warehouseId: 1,
    warehouseCode: 'WH-BLR-001',
    warehouseName: 'Bengaluru Central Hub',
  };
  const token = 'mock_jwt_token_warehouse_manager';

  await ev(`
    const u = ${JSON.stringify(JSON.stringify(user))};
    const t = ${JSON.stringify(token)};
    localStorage.setItem('auth_token', t);
    localStorage.setItem('auth_user', u);
    sessionStorage.setItem('auth_token', t);
    sessionStorage.setItem('auth_user', u);
    localStorage.setItem('token', t);
    localStorage.setItem('user', u);
  `);

  await send('Page.navigate', { url: 'http://localhost:5173/warehouse/incoming' });
  await new Promise((r) => setTimeout(r, 2000));

  const info = await ev(`
    (() => {
      const header = document.querySelector('.header');
      const hRect = header ? header.getBoundingClientRect() : null;
      const h1 = document.querySelector('h1');
      const h1Rect = h1 ? h1.getBoundingClientRect() : null;
      const table = document.querySelector('table');
      const tRect = table ? table.getBoundingClientRect() : null;
      const card = table ? table.closest('div[style*="border-radius"], div[style*="borderRadius"]') : null;
      const cRect = card ? card.getBoundingClientRect() : null;
      const tableContainer = table ? table.parentElement : null;
      const ths = Array.from(document.querySelectorAll('th')).map(th => ({ text: th.textContent.trim(), width: th.offsetWidth }));
      const actionTh = document.querySelector('.wh-actions-header');
      const actionTd = document.querySelector('.wh-actions-cell');

      return {
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        header: hRect ? { top: hRect.top, height: hRect.height, zIndex: window.getComputedStyle(header).zIndex, bg: window.getComputedStyle(header).backgroundColor } : null,
        h1: h1Rect ? { top: h1Rect.top, height: h1Rect.height } : null,
        cardWidth: cRect ? cRect.width : null,
        tableWidth: tRect ? tRect.width : null,
        tableContainerScrollWidth: tableContainer ? tableContainer.scrollWidth : null,
        tableContainerClientWidth: tableContainer ? tableContainer.clientWidth : null,
        hasHorizontalScroll: tableContainer ? tableContainer.scrollWidth > tableContainer.clientWidth : false,
        actionTh: actionTh ? { offsetWidth: actionTh.offsetWidth, right: actionTh.getBoundingClientRect().right } : null,
        containerRight: tableContainer ? tableContainer.getBoundingClientRect().right : null,
        ths
      };
    })()
  `);

  console.log('Inspection Results:', JSON.stringify(info, null, 2));

  ws.close();
  chromeProc.kill();
}

main().catch(console.error);
