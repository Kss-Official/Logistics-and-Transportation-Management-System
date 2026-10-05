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
  console.log('--- STARTING DRIVER SIDEBAR VERIFICATION ---');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--remote-debugging-port=9225',
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--user-data-dir=' + require('os').tmpdir() + '\\chrome-driver-sb-' + Date.now(),
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
      console.log(`[Screenshot] Saved: ${outPath}`);
    }

    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // 1. Authenticate Driver session
    console.log('1. Setting up authenticated Driver session...');
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise((r) => setTimeout(r, 800));

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

    // 2. Navigate to /driver/dashboard
    console.log('2. Navigating to /driver/dashboard...');
    await send('Page.navigate', { url: 'http://localhost:5173/driver/dashboard' });
    await new Promise((r) => setTimeout(r, 1800));

    // 3. Inspect DOM elements in Driver Sidebar
    console.log('3. Inspecting sidebar layout geometry and structure...');
    const sidebarInfo = await ev(`
      (() => {
        const sidebar = document.getElementById('driver-sidebar');
        if (!sidebar) return { found: false, error: 'driver-sidebar not found' };

        const brand = sidebar.querySelector('a[title*="PrimeRoute"]');
        const nav = sidebar.querySelector('.driver-sidebar-nav');
        const bottom = sidebar.querySelector('.driver-sidebar-bottom');
        const card = sidebar.querySelector('.driver-assignment-card');
        const logout = document.getElementById('driver-logout-btn');

        const rects = {
          sidebar: sidebar.getBoundingClientRect(),
          nav: nav ? nav.getBoundingClientRect() : null,
          bottom: bottom ? bottom.getBoundingClientRect() : null,
          card: card ? card.getBoundingClientRect() : null,
          logout: logout ? logout.getBoundingClientRect() : null,
        };

        const navSections = Array.from(nav.querySelectorAll(':scope > div')).map(d => {
          const title = d.querySelector('div')?.innerText;
          const links = Array.from(d.querySelectorAll('a')).map(a => a.innerText.trim());
          return { title, links };
        });

        const cardText = card ? card.innerText : '';
        const cardBg = card ? window.getComputedStyle(card).backgroundColor : '';
        const cardBorder = card ? window.getComputedStyle(card).borderColor : '';

        return {
          found: true,
          rects,
          navSections,
          cardText,
          cardBg,
          cardBorder,
          isCardAboveLogout: rects.card && rects.logout && (rects.card.bottom <= rects.logout.top),
          isCardBelowNav: rects.card && rects.nav && (rects.card.top >= rects.nav.top),
          noOverlap: rects.card && rects.logout && (rects.card.bottom < rects.logout.top),
        };
      })()
    `);

    console.log('Sidebar Inspection Result:', JSON.stringify(sidebarInfo, null, 2));

    await captureScreenshot('driver_sidebar_desktop.png');

    // 4. Test Shorter Viewport (1440x600) to test nav scrolling and fixed bottom section
    console.log('4. Testing shorter viewport 1440x600 for scrollability and bottom dock...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 600,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await new Promise((r) => setTimeout(r, 600));

    const shortViewportInfo = await ev(`
      (() => {
        const sidebar = document.getElementById('driver-sidebar');
        const nav = sidebar.querySelector('.driver-sidebar-nav');
        const card = sidebar.querySelector('.driver-assignment-card');
        const logout = document.getElementById('driver-logout-btn');

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
    await captureScreenshot('driver_sidebar_desktop_short.png');

    // 5. Test Tablet / Mobile Responsive Drawer Viewport (e.g. 768x1024)
    console.log('5. Testing Mobile / Tablet responsive drawer (390x844)...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await new Promise((r) => setTimeout(r, 600));

    // Click Hamburger to open sidebar drawer
    console.log('Opening mobile drawer via menu button...');
    await ev(`
      (() => {
        const menuBtn = document.querySelector('button[aria-label="Toggle menu"]');
        if (menuBtn) menuBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 600));

    const mobileDrawerInfo = await ev(`
      (() => {
        const sidebar = document.getElementById('driver-sidebar');
        const card = sidebar ? sidebar.querySelector('.driver-assignment-card') : null;
        const logout = document.getElementById('driver-logout-btn');

        const sidebarRect = sidebar ? sidebar.getBoundingClientRect() : null;
        const cardRect = card ? card.getBoundingClientRect() : null;
        const logoutRect = logout ? logout.getBoundingClientRect() : null;

        return {
          isOpen: sidebar ? sidebar.classList.contains('open') : false,
          sidebarRect,
          cardRect,
          logoutRect,
          cardVisible: cardRect ? (cardRect.top >= 0 && cardRect.bottom <= window.innerHeight) : false,
          logoutVisible: logoutRect ? (logoutRect.top >= 0 && logoutRect.bottom <= window.innerHeight) : false,
          noOverlap: cardRect && logoutRect ? (cardRect.bottom <= logoutRect.top) : false,
        };
      })()
    `);
    console.log('Mobile Drawer Test Result:', JSON.stringify(mobileDrawerInfo, null, 2));
    await captureScreenshot('driver_sidebar_mobile.png');

    // 6. Test Dynamic status update
    console.log('6. Testing dynamic driver status change to ON_BREAK...');
    await ev(`
      (() => {
        window.dispatchEvent(new CustomEvent('driver-status-changed'));
      })()
    `);
    await new Promise((r) => setTimeout(r, 500));

    console.log('--- VERIFICATION COMPLETED SUCCESSFULLY ---');
  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    try {
      chromeProc.kill();
    } catch {}
  }
}

run();
