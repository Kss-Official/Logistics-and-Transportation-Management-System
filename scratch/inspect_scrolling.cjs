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

  // Launch headless Chrome
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1440,900',
    'about:blank',
  ]);

  try {
    await sleep(2000);
    const versionRes = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9223/json/list', (r) => {
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

    // Seed localStorage and sessionStorage
    await cdp.eval(`
      const u = ${JSON.stringify(JSON.stringify(user))};
      const t = ${JSON.stringify(token)};
      localStorage.setItem('auth_token', t);
      localStorage.setItem('auth_user', u);
      sessionStorage.setItem('auth_token', t);
      sessionStorage.setItem('auth_user', u);
      localStorage.setItem('token', t);
      localStorage.setItem('user', u);
    `);

    const routesToCheck = [
      '/warehouse/dashboard',
      '/warehouse/inventory',
      '/warehouse/incoming',
      '/warehouse/outgoing',
      '/warehouse/dispatch',
      '/warehouse/driver-tracking',
      '/warehouse/vehicle-tracking',
      '/warehouse/live-map',
      '/warehouse/details',
      '/warehouse/reports',
      '/warehouse/notifications',
      '/warehouse/profile',
      '/warehouse/support',
    ];

    for (const route of routesToCheck) {
      await cdp.send('Page.navigate', { url: `http://localhost:5173${route}` });
      await sleep(1500);

      const scrollDiag = await cdp.eval(`
        (() => {
          const appShell = document.querySelector('.app-shell');
          const mainWrapper = document.querySelector('.main-wrapper');
          const pageContent = document.querySelector('.page-content');
          const doc = document.documentElement;
          const body = document.body;

          // Find any elements with nested vertical scrolling (excluding nav.sidebar-nav and live-map ops panel)
          const nestedScrollContainers = [];
          const all = document.querySelectorAll('*');
          for (const el of all) {
            const cs = window.getComputedStyle(el);
            const ovY = cs.overflowY;
            if ((ovY === 'auto' || ovY === 'scroll') && el.scrollHeight > el.clientHeight) {
              const tag = el.tagName.toLowerCase();
              const cls = el.className && typeof el.className === 'string' ? el.className.trim() : '';
              if (!cls.includes('sidebar-nav') && !cls.includes('wh-drawer-body')) {
                nestedScrollContainers.push({
                  tag,
                  cls,
                  clientH: el.clientHeight,
                  scrollH: el.scrollHeight,
                  ovY,
                });
              }
            }
          }

          return {
            currentPath: window.location.pathname,
            windowInnerH: window.innerHeight,
            doc: { clientH: doc.clientHeight, scrollH: doc.scrollHeight, scrollY: window.scrollY },
            appShell: appShell ? { ovX: getComputedStyle(appShell).overflowX, ovY: getComputedStyle(appShell).overflowY } : null,
            mainWrapper: mainWrapper ? { ovX: getComputedStyle(mainWrapper).overflowX, ovY: getComputedStyle(mainWrapper).overflowY } : null,
            pageContent: pageContent ? { ovX: getComputedStyle(pageContent).overflowX, ovY: getComputedStyle(pageContent).overflowY } : null,
            nestedScrollContainers,
          };
        })()
      `);

      console.log('Route:', route);
      console.log(' - Pathname:', scrollDiag.currentPath);
      console.log(' - Doc clientH:', scrollDiag.doc.clientH, 'scrollH:', scrollDiag.doc.scrollH);
      console.log(' - Layout overflow:', { appShell: scrollDiag.appShell, mainWrapper: scrollDiag.mainWrapper, pageContent: scrollDiag.pageContent });
      console.log(' - Nested scroll containers (outside sidebar/drawer):', scrollDiag.nestedScrollContainers.length, scrollDiag.nestedScrollContainers);
    }

    cdp.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chromeProc.kill();
  }
}

main();
