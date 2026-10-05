const http = require('http');
const { spawn, execSync } = require('child_process');
const os = require('os');

function runSql(query) {
  try {
    const singleLine = query.replace(/"/g, '`"').replace(/\r?\n/g, ' ');
    const cmd = `powershell -Command "$env:PGPASSWORD='postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -h localhost -p 5432 -c \\"${singleLine}\\" -t -A"`;
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch (e) {
    console.error('SQL Execution Error:', e.message);
    return null;
  }
}

function apiRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

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
  console.log('=== REAL BROWSER CDP AUDIT FOR WAREHOUSE NOTIFICATIONS ===');

  // Insert test notifications in DB
  const priyaId = runSql(`SELECT id FROM users WHERE email = 'priya@primeroute.com';`);
  runSql(`
    INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
    VALUES 
      (${priyaId}, 'Pallet Relocation Alert', 'Move pallets from bay 2 to 6', 'WARNING', false, NOW()),
      (${priyaId}, 'Inbound Dock Arrival', 'Carrier Trailer TRK-882 docked', 'INFO', false, NOW());
  `);

  const whAuth = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'priya@primeroute.com', password: 'Manager@2026!' });

  const token = whAuth.data?.token;
  console.log('Warehouse Manager Auth Token:', token ? 'Acquired' : 'FAILED');
  if (!token) process.exit(1);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--remote-debugging-port=9227',
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--user-data-dir=' + os.tmpdir() + '\\chrome-wm-verify-' + Date.now(),
  ]);

  await new Promise((r) => setTimeout(r, 2000));

  const consoleErrors = [];
  const networkErrors = [];

  try {
    const tabs = await getJson('http://localhost:9227/json');
    const pageTarget = tabs.find((t) => t.type === 'page') || tabs[0];
    const ws = new (globalThis.WebSocket)(pageTarget.webSocketDebuggerUrl);
    await new Promise((r) => (ws.onopen = r));

    let msgId = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg);
        callbacks.delete(msg.id);
      }
      if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        const text = msg.params.args.map((a) => a.value || JSON.stringify(a)).join(' ');
        if (!text.includes('tile.openstreetmap.org') && !text.includes('favicon')) {
          consoleErrors.push(text);
        }
      }
      if (msg.method === 'Network.responseReceived') {
        const res = msg.params.response;
        if (res.status >= 400 && !res.url.includes('favicon')) {
          networkErrors.push(`[${res.status}] ${res.url}`);
        }
      }
    };

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        callbacks.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Runtime.enable');
    await send('Network.enable');
    await send('Page.enable');

    // Seed localStorage auth
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise((r) => setTimeout(r, 1000));

    const authPayload = JSON.stringify({
      token: token,
      user: {
        email: 'priya@primeroute.com',
        role: 'ROLE_WAREHOUSE_MANAGER',
        name: 'Priya Sharma',
        fullName: 'Priya Sharma',
        warehouseCode: 'WH-BLR-001',
        warehouseId: 1
      },
      isAuthenticated: true
    });

    await send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('auth_token', '${token}');
        localStorage.setItem('token', '${token}');
        localStorage.setItem('user', JSON.stringify({ email: 'priya@primeroute.com', role: 'ROLE_WAREHOUSE_MANAGER', fullName: 'Priya Sharma' }));
        localStorage.setItem('auth_state', JSON.stringify(${JSON.stringify(authPayload)}));
      `
    });

    // Navigate to warehouse dashboard
    console.log('Navigating to http://localhost:5173/warehouse/dashboard...');
    await send('Page.navigate', { url: 'http://localhost:5173/warehouse/dashboard' });
    await new Promise((r) => setTimeout(r, 2000));

    // Evaluate Header Bell and click it
    console.log('Clicking notification bell...');
    const bellClickRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('header button, [aria-label*="notification" i], [aria-label*="Notification" i]'));
          const bell = btns.find(b => b.querySelector('svg') || b.getAttribute('aria-label')?.includes('otification'));
          if (bell) {
            bell.click();
            return { clicked: true, html: bell.outerHTML };
          }
          return { clicked: false, totalBtns: btns.length };
        })()
      `,
      returnByValue: true
    });
    console.log('Bell Click Evaluation:', bellClickRes.result?.value);
    await new Promise((r) => setTimeout(r, 1000));

    // Check dropdown content and click "Mark all as read"
    console.log('Checking dropdown and clicking Mark All as Read...');
    const markAllRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const markAll = btns.find(b => b.textContent && b.textContent.toLowerCase().includes('mark all'));
          if (markAll) {
            markAll.click();
            return { clicked: true, text: markAll.textContent.trim() };
          }
          return { clicked: false };
        })()
      `,
      returnByValue: true
    });
    console.log('Mark All Button Evaluation:', markAllRes.result?.value);
    await new Promise((r) => setTimeout(r, 1500));

    // Verify unread badge in DOM
    const badgeCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const badges = Array.from(document.querySelectorAll('header span, .badge, [class*="badge"]'));
          return badges.map(b => b.textContent.trim()).filter(t => /^[0-9]+$/.test(t));
        })()
      `,
      returnByValue: true
    });
    console.log('Numeric badges in header after Mark All:', badgeCheck.result?.value);

    // Responsive checks
    const viewports = [
      { width: 1280, height: 800 },
      { width: 1024, height: 768 },
      { width: 768, height: 1024 },
    ];

    for (const vp of viewports) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: false
      });
      await new Promise((r) => setTimeout(r, 500));

      const overflowRes = await send('Runtime.evaluate', {
        expression: `({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          hasOverflow: document.documentElement.scrollWidth > window.innerWidth
        })`,
        returnByValue: true
      });
      console.log(`Viewport ${vp.width}x${vp.height} overflow check:`, overflowRes.result?.value);
    }

    ws.close();
  } catch (e) {
    console.error('CDP Error:', e);
  } finally {
    chromeProc.kill();
  }

  console.log('\n======================================================');
  console.log('BROWSER CONSOLE & NETWORK AUDIT:');
  console.log('Console Errors count:', consoleErrors.length);
  if (consoleErrors.length > 0) console.log('Errors:', consoleErrors);
  console.log('Network >= 400 count:', networkErrors.length);
  if (networkErrors.length > 0) console.log('Network Errors:', networkErrors);
  console.log('======================================================\n');
}

run();
