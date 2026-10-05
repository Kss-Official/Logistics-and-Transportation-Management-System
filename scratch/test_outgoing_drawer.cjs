const http = require('http');

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let b = '';
      res.on('data', (c) => (b += c));
      res.on('end', () => resolve(JSON.parse(b)));
    }).on('error', reject);
  });
}

async function main() {
  const tabs = await getJson('http://localhost:9222/json');
  const ws = new (globalThis.WebSocket)(tabs[0].webSocketDebuggerUrl);
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

  await send('Page.navigate', { url: 'http://localhost:5173/warehouse/outgoing' });
  await new Promise((r) => setTimeout(r, 1500));

  const before = await ev('document.body.style.overflow');
  console.log('Before click: body.style.overflow =', JSON.stringify(before));

  const clicked = await ev(`(() => {
    const btn = document.querySelector('button[title="View Shipment Details"]');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  })()`);
  console.log('Clicked "View Shipment Details" button:', clicked);

  await new Promise((r) => setTimeout(r, 500));

  const after = await ev(`({
    bodyOverflow: document.body.style.overflow,
    hasOverlay: !!document.querySelector('.wh-drawer-overlay'),
    hasDrawer: !!document.querySelector('.wh-drawer'),
    drawerScrollable: !!document.querySelector('.wh-drawer-body')
  })`);
  console.log('After open:', after);

  // Close drawer
  await ev(`(() => {
    const closeBtn = document.querySelector('.wh-drawer-close');
    if (closeBtn) closeBtn.click();
  })()`);
  await new Promise((r) => setTimeout(r, 400));

  const closed = await ev('document.body.style.overflow');
  console.log('After close: body.style.overflow =', JSON.stringify(closed));

  ws.close();
}

main().catch(console.error);
