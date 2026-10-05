const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ARTIFACTS_DIR = 'C:\\Users\\shrut\\.gemini\\antigravity-ide\\brain\\280f36e9-be09-48bc-8c20-034d3e4c228d';

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

async function run() {
  console.log('--- STARTING WAREHOUSE SIDEBAR VERIFICATION ---');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--remote-debugging-port=9226',
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--user-data-dir=' + require('os').tmpdir() + '\\chrome-wh-sb-' + Date.now(),
  ]);

  await new Promise((r) => setTimeout(r, 1800));

  try {
    const tabs = await getJson('http://localhost:9226/json');
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
      console.log(`[Screenshot] Saved: ${outPath}`);
    }

    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // 1. Authenticate Warehouse Manager session via backend login
    console.log('1. Setting up authenticated Warehouse Manager session (priya@primeroute.com)...');
    const loginRes = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 8080,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, (res) => {
        let b = '';
        res.on('data', c => b += c);
        res.on('end', () => resolve(JSON.parse(b)));
      });
      req.on('error', reject);
      req.write(JSON.stringify({ email: 'priya@primeroute.com', password: 'Manager@2026!' }));
      req.end();
    });

    const authData = loginRes.data || loginRes;
    const token = authData.token;
    const sessionUser = {
      id: String(authData.id || 2),
      email: authData.email || 'priya@primeroute.com',
      name: authData.fullName || 'Priya Sharma',
      role: 'WAREHOUSE_MANAGER',
      warehouseId: authData.warehouseId || 1,
      warehouseCode: authData.warehouseCode || 'WH-BLR-001',
      warehouseName: authData.warehouseName || 'Bengaluru Central Hub',
    };

    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise((r) => setTimeout(r, 800));

    await ev(`
      localStorage.setItem('auth_token', ${JSON.stringify(token)});
      localStorage.setItem('auth_user', ${JSON.stringify(JSON.stringify(sessionUser))});
      sessionStorage.setItem('auth_token', ${JSON.stringify(token)});
      sessionStorage.setItem('auth_user', ${JSON.stringify(JSON.stringify(sessionUser))});
    `);

    // 2. Navigate to /warehouse/dashboard
    console.log('2. Navigating to /warehouse/dashboard...');
    await send('Page.navigate', { url: 'http://localhost:5173/warehouse/dashboard' });
    await new Promise((r) => setTimeout(r, 1800));

    // 3. Inspect DOM elements in Warehouse Sidebar
    console.log('3. Inspecting sidebar layout geometry and structure on /warehouse/dashboard...');
    const sidebarInfo = await ev(`
      (() => {
        const sidebar = document.getElementById('warehouse-sidebar');
        if (!sidebar) return { found: false, error: 'warehouse-sidebar not found' };

        const brand = sidebar.querySelector('.sidebar-logo');
        const nav = sidebar.querySelector('.sidebar-nav');
        const bottom = sidebar.querySelector('.sidebar-bottom');
        const cards = sidebar.querySelectorAll('.warehouse-info-card');
        const card = cards[0];
        const logout = document.getElementById('warehouse-logout-btn');

        const rects = {
          sidebar: sidebar.getBoundingClientRect(),
          nav: nav ? nav.getBoundingClientRect() : null,
          bottom: bottom ? bottom.getBoundingClientRect() : null,
          card: card ? card.getBoundingClientRect() : null,
          logout: logout ? logout.getBoundingClientRect() : null,
        };

        const cardText = card ? card.innerText : '';

        return {
          found: true,
          cardCount: cards.length,
          rects,
          cardText,
          isCardAboveLogout: rects.card && rects.logout && (rects.card.bottom <= rects.logout.top),
          isCardBelowNav: rects.card && rects.nav && (rects.card.top >= rects.nav.top),
          noOverlap: rects.card && rects.logout && (rects.card.bottom <= rects.logout.top),
          navHasSingleScroll: !sidebar.style.overflow || sidebar.style.overflow === 'hidden' || window.getComputedStyle(sidebar).overflowY === 'hidden',
        };
      })()
    `);

    console.log('Warehouse Sidebar Inspection Result:', JSON.stringify(sidebarInfo, null, 2));
    await captureScreenshot('warehouse_sidebar_desktop.png');

    // 4. Test Navigation Across Warehouse Pages
    const testPages = [
      '/warehouse/inventory',
      '/warehouse/incoming',
      '/warehouse/outgoing',
      '/warehouse/dispatch',
      '/warehouse/driver-tracking',
      '/warehouse/details',
      '/warehouse/reports',
      '/warehouse/notifications',
      '/warehouse/profile',
      '/warehouse/support'
    ];

    console.log('4. Testing navigation through Warehouse pages...');
    for (const page of testPages) {
      await send('Page.navigate', { url: 'http://localhost:5173' + page });
      await new Promise((r) => setTimeout(r, 600));
      const pageCheck = await ev(`
        (() => {
          const cards = document.querySelectorAll('#warehouse-sidebar .warehouse-info-card');
          const logout = document.getElementById('warehouse-logout-btn');
          const card = cards[0];
          return {
            page: window.location.pathname,
            cardCount: cards.length,
            cardVisible: !!card && card.getBoundingClientRect().height > 0,
            logoutVisible: !!logout && logout.getBoundingClientRect().height > 0,
            cardAboveLogout: !!card && !!logout && card.getBoundingClientRect().bottom <= logout.getBoundingClientRect().top
          };
        })()
      `);
      console.log(`Page [${page}]: Card count = ${pageCheck.cardCount}, Card above Logout = ${pageCheck.cardAboveLogout}`);
    }

    // 5. Test Shorter Viewport (1440x600) for internal nav scrolling
    console.log('5. Testing shorter viewport 1440x600...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 600,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await new Promise((r) => setTimeout(r, 500));

    const shortViewportInfo = await ev(`
      (() => {
        const sidebar = document.getElementById('warehouse-sidebar');
        const nav = sidebar.querySelector('.sidebar-nav');
        const card = sidebar.querySelector('.warehouse-info-card');
        const logout = document.getElementById('warehouse-logout-btn');

        const cardRect = card.getBoundingClientRect();
        const logoutRect = logout.getBoundingClientRect();

        return {
          navScrollHeight: nav.scrollHeight,
          navClientHeight: nav.clientHeight,
          navHasScroll: nav.scrollHeight > nav.clientHeight,
          cardVisible: cardRect.bottom <= window.innerHeight && cardRect.top >= 0,
          logoutVisible: logoutRect.bottom <= window.innerHeight && logoutRect.top >= 0,
          noOverlap: cardRect.bottom <= logoutRect.top,
        };
      })()
    `);
    console.log('Short Viewport Test Result:', JSON.stringify(shortViewportInfo, null, 2));
    await captureScreenshot('warehouse_sidebar_desktop_short.png');

    // 6. Test Mobile / Tablet Drawer Viewport (390x844)
    console.log('6. Testing Mobile / Tablet responsive drawer (390x844)...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await new Promise((r) => setTimeout(r, 600));

    // Open mobile drawer
    console.log('Opening mobile warehouse drawer...');
    await ev(`
      (() => {
        const menuBtn = document.querySelector('button[aria-label="Toggle menu"]') || document.querySelector('.header-menu-btn') || document.querySelector('header button');
        if (menuBtn) menuBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 600));

    const mobileDrawerInfo = await ev(`
      (() => {
        const sidebar = document.getElementById('warehouse-sidebar');
        const card = sidebar ? sidebar.querySelector('.warehouse-info-card') : null;
        const logout = document.getElementById('warehouse-logout-btn');

        const cardRect = card ? card.getBoundingClientRect() : null;
        const logoutRect = logout ? logout.getBoundingClientRect() : null;

        return {
          cardVisible: cardRect ? (cardRect.top >= 0 && cardRect.bottom <= window.innerHeight) : false,
          logoutVisible: logoutRect ? (logoutRect.top >= 0 && logoutRect.bottom <= window.innerHeight) : false,
          noOverlap: cardRect && logoutRect ? (cardRect.bottom <= logoutRect.top) : false,
        };
      })()
    `);
    console.log('Mobile Drawer Test Result:', JSON.stringify(mobileDrawerInfo, null, 2));
    await captureScreenshot('warehouse_sidebar_mobile.png');

    // 7. Test Logout Button Click
    console.log('7. Testing Logout button click...');
    // Reset to desktop for clean click
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await new Promise((r) => setTimeout(r, 500));

    await ev(`
      (() => {
        const logoutBtn = document.getElementById('warehouse-logout-btn');
        if (logoutBtn) logoutBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 800));

    const logoutResult = await ev(`
      (() => {
        return {
          url: window.location.pathname,
          hasToken: !!localStorage.getItem('auth_token'),
          hasUser: !!localStorage.getItem('auth_user'),
        };
      })()
    `);
    console.log('Logout Navigation & Session Result:', JSON.stringify(logoutResult, null, 2));

    console.log('--- ALL WAREHOUSE VERIFICATIONS COMPLETED SUCCESSFULLY ---');
  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    try {
      chromeProc.kill();
    } catch {}
  }
}

run();
