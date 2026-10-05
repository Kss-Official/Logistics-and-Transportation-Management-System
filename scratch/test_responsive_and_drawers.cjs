const http = require('http');
const { spawn } = require('child_process');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

class SimpleCDP {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    const WebSocket = globalThis.WebSocket;
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const cb = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) cb.reject(msg.error);
        else cb.resolve(msg.result);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result?.value;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function main() {
  const loginRes = await apiLogin('priya@primeroute.com', 'Manager@2026!');
  const token = loginRes.token;
  const user = {
    id: '1',
    email: loginRes.email,
    name: loginRes.fullName,
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
    '--window-size=1440,900',
    'about:blank',
  ]);

  try {
    await sleep(2000);
    const versionRes = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9224/json/list', (r) => {
        let d = '';
        r.on('data', (c) => (d += c));
        r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });

    const pageTarget = versionRes.find((t) => t.type === 'page');
    const cdp = new SimpleCDP(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/' });
    await sleep(1500);

    await cdp.eval(`
      const u = ${JSON.stringify(JSON.stringify(user))};
      const t = ${JSON.stringify(token)};
      localStorage.setItem('auth_token', t);
      localStorage.setItem('auth_user', u);
      sessionStorage.setItem('auth_token', t);
      sessionStorage.setItem('auth_user', u);
    `);

    // ── 1. TEST DRAWER BEHAVIOR ON INCOMING & OUTGOING ──
    console.log('=== TEST 1: DRAWER OPEN / CLOSE & SCROLL LOCK ===');
    for (const route of ['/warehouse/incoming', '/warehouse/outgoing']) {
      await cdp.send('Page.navigate', { url: `http://localhost:5173${route}` });
      await sleep(1500);

      const beforeOpen = await cdp.eval(`document.body.style.overflow`);
      console.log(`${route} - Before drawer: body.style.overflow = "${beforeOpen}"`);

      // Click the "View" / "View Details" button in the table
      const clicked = await cdp.eval(`
        (() => {
          const btn = document.querySelector('button[title="View Shipment Details"], button[title*="View"], .wh-action-btn-icon-only, .wh-actions-cell button:last-child');
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        })()
      `);
      await sleep(600);

      const afterOpen = await cdp.eval(`
        (() => {
          const overlay = document.querySelector('.wh-drawer-overlay');
          const drawer = document.querySelector('.wh-drawer');
          return {
            bodyOverflow: document.body.style.overflow,
            hasOverlay: !!overlay,
            hasDrawer: !!drawer,
            drawerBodyScrollable: drawer ? !!drawer.querySelector('.wh-drawer-body') : false,
          };
        })()
      `);
      console.log(`${route} - Drawer open:`, afterOpen);

      // Close the drawer by clicking close button or overlay
      await cdp.eval(`
        (() => {
          const closeBtn = document.querySelector('.wh-drawer-header button, .wh-drawer-footer button');
          if (closeBtn) closeBtn.click();
        })()
      `);
      await sleep(500);

      const afterClose = await cdp.eval(`
        (() => {
          const overlay = document.querySelector('.wh-drawer-overlay');
          return {
            bodyOverflow: document.body.style.overflow,
            hasOverlay: !!overlay,
          };
        })()
      `);
      console.log(`${route} - After close:`, afterClose);
    }

    // ── 2. TEST ACTIONS COLUMN CENTERING & BUTTON HEIGHTS ──
    console.log('\\n=== TEST 2: ACTIONS COLUMN UI & ALIGNMENT ===');
    for (const route of ['/warehouse/incoming', '/warehouse/outgoing']) {
      await cdp.send('Page.navigate', { url: `http://localhost:5173${route}` });
      await sleep(1500);

      const actionsCheck = await cdp.eval(`
        (() => {
          const th = document.querySelector('th.wh-actions-header');
          const td = document.querySelector('td.wh-actions-cell');
          const group = document.querySelector('.wh-actions-group');
          const buttons = document.querySelectorAll('.wh-actions-cell .wh-action-btn');

          const btnHeights = Array.from(buttons).map(b => b.offsetHeight);
          return {
            thTextAlign: th ? window.getComputedStyle(th).textAlign : null,
            tdTextAlign: td ? window.getComputedStyle(td).textAlign : null,
            groupJustifyContent: group ? window.getComputedStyle(group).justifyContent : null,
            groupAlignItems: group ? window.getComputedStyle(group).alignItems : null,
            buttonCount: buttons.length,
            buttonHeights: btnHeights,
            allSameHeight: btnHeights.length > 0 && btnHeights.every(h => h === btnHeights[0]),
          };
        })()
      `);
      console.log(`${route} - Actions Column:`, actionsCheck);
    }

    // ── 3. TEST RESPONSIVE BREAKPOINTS (Desktop, Laptop, Tablet, Mobile) ──
    console.log('\\n=== TEST 3: RESPONSIVE BREAKPOINTS ===');
    const viewports = [
      { name: 'Desktop (1440x900)', width: 1440, height: 900 },
      { name: 'Laptop (1280x800)', width: 1280, height: 800 },
      { name: 'Tablet (768x1024)', width: 768, height: 1024 },
      { name: 'Mobile (375x667)', width: 375, height: 667 },
    ];

    for (const vp of viewports) {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.width < 1024,
      });

      await cdp.send('Page.navigate', { url: 'http://localhost:5173/warehouse/outgoing' });
      await sleep(1000);

      const vpCheck = await cdp.eval(`
        (() => {
          const doc = document.documentElement;
          const body = document.body;
          const appShell = document.querySelector('.app-shell');
          const mainWrapper = document.querySelector('.main-wrapper');
          const pageContent = document.querySelector('.page-content');

          return {
            windowInnerWidth: window.innerWidth,
            docScrollWidth: doc.scrollWidth,
            docClientWidth: doc.clientWidth,
            hasWindowHorizontalScroll: doc.scrollWidth > doc.clientWidth,
            verticalScrollPrimary: doc.scrollHeight > doc.clientHeight,
            appShellOverflowY: appShell ? window.getComputedStyle(appShell).overflowY : null,
            mainWrapperOverflowY: mainWrapper ? window.getComputedStyle(mainWrapper).overflowY : null,
            pageContentOverflowY: pageContent ? window.getComputedStyle(pageContent).overflowY : null,
          };
        })()
      `);
      console.log(`Viewport: ${vp.name}`);
      console.log(' - Doc width:', vpCheck.docClientWidth, 'scrollWidth:', vpCheck.docScrollWidth, 'hasWindowHorizScroll:', vpCheck.hasWindowHorizontalScroll);
      console.log(' - Layout overflow-y:', { appShell: vpCheck.appShellOverflowY, mainWrapper: vpCheck.mainWrapperOverflowY, pageContent: vpCheck.pageContentOverflowY });
    }

    cdp.close();
  } catch (err) {
    console.error('Error in test:', err);
  } finally {
    chromeProc.kill();
  }
}

main();
