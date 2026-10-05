const http = require('http');
const { spawn } = require('child_process');
const os = require('os');

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
  console.log('======================================================');
  console.log('MULTI-PORTAL REAL BROWSER CDP RUNTIME VERIFICATION');
  console.log('======================================================\n');

  // Step 1: Login accounts
  console.log('Authenticating accounts via backend...');
  const whAuth = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'priya@primeroute.com', password: 'Manager@2026!' });

  const drvAuth = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'ramesh@primeroute.com', password: 'Driver@2026!' });

  const custAuth = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'shrutisanjanasahoo@gmail.com', password: 'Driver@2026!' });

  if (!whAuth.data?.token || !drvAuth.data?.token || !custAuth.data?.token) {
    console.error('Login failed for one or more users!', { whAuth, drvAuth, custAuth });
    process.exit(1);
  }
  console.log('✓ All 3 accounts authenticated successfully.');

  // Step 2: Launch Chrome with CDP
  console.log('\nLaunching Headless Chrome on CDP port 9226...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--remote-debugging-port=9226',
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--user-data-dir=' + os.tmpdir() + '\\chrome-portal-verify-' + Date.now(),
  ]);

  await new Promise((r) => setTimeout(r, 2000));

  const criticalErrors = [];
  const networkErrors = [];

  try {
    const tabs = await getJson('http://localhost:9226/json');
    const pageTarget = tabs.find((t) => t.type === 'page') || tabs[0];
    const ws = new (globalThis.WebSocket)(pageTarget.webSocketDebuggerUrl);
    await new Promise((r) => (ws.onopen = r));

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const curId = msgId++;
        const handler = (evt) => {
          const d = JSON.parse(evt.data);
          if (d.id === curId) {
            ws.removeEventListener('message', handler);
            resolve(d.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    ws.addEventListener('message', (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const type = msg.params.type;
        const text = msg.params.args.map((a) => a.value || a.description || JSON.stringify(a)).join(' ');
        if (
          text.includes('Maximum update depth exceeded') ||
          text.includes('React has detected a change in the order of Hooks') ||
          text.includes('Should have a queue') ||
          text.includes('The final argument passed to useEffect changed size') ||
          text.includes('Uncaught') ||
          type === 'error'
        ) {
          criticalErrors.push(`[Console ${type.toUpperCase()}] ${text}`);
          console.error(`  🚨 [BROWSER CONSOLE ${type.toUpperCase()}]: ${text}`);
        }
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        const desc = msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text;
        criticalErrors.push(`[Browser Exception] ${desc}`);
        console.error(`  🚨 [EXCEPTION]: ${desc}`);
      }
      if (msg.method === 'Network.responseReceived') {
        const status = msg.params.response?.status;
        const url = msg.params.response?.url;
        if (status >= 400) {
          networkErrors.push(`${status} ${url}`);
          console.warn(`  ⚠️ [HTTP ${status}] ${url}`);
          if (url.includes('/api/customer/notifications')) {
            criticalErrors.push(`[ILLEGAL NOTIF CALL ${status}] ${url}`);
          }
        }
      }
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');

    async function setSession(token, user) {
      await send('Runtime.evaluate', {
        expression: `
          localStorage.setItem('auth_token', ${JSON.stringify(token)});
          localStorage.setItem('auth_user', ${JSON.stringify(JSON.stringify(user))});
          sessionStorage.setItem('auth_token', ${JSON.stringify(token)});
          sessionStorage.setItem('auth_user', ${JSON.stringify(JSON.stringify(user))});
        `,
      });
    }

    // ── 1. WAREHOUSE MANAGER RUNTIME VERIFICATION ──
    console.log('\n[1/3] Testing Warehouse Manager Portal (/warehouse/live-map and routes)...');
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise((r) => setTimeout(r, 1000));
    await setSession(whAuth.data.token, {
      id: 'WM-001',
      email: whAuth.data.email,
      name: whAuth.data.fullName || 'Priya Sharma',
      role: 'WAREHOUSE_MANAGER',
      warehouseCode: 'WH-BLR-001',
    });

    const whRoutes = [
      'http://localhost:5173/warehouse/live-map',
      'http://localhost:5173/warehouse/dashboard',
      'http://localhost:5173/warehouse/orders',
      'http://localhost:5173/warehouse/inventory',
      'http://localhost:5173/warehouse/outgoing',
      'http://localhost:5173/warehouse/dispatch',
      'http://localhost:5173/warehouse/profile',
    ];

    for (const url of whRoutes) {
      console.log(`  -> Navigating to: ${url}`);
      await send('Page.navigate', { url });
      await new Promise((r) => setTimeout(r, 1200));
    }

    // ── 2. DRIVER RUNTIME VERIFICATION ──
    console.log('\n[2/3] Testing Driver Portal (/driver/current-delivery and all routes)...');
    await setSession(drvAuth.data.token, {
      id: 'DRV-001',
      email: drvAuth.data.email,
      name: drvAuth.data.fullName || 'Ramesh Kumar',
      role: 'DRIVER',
      driverCode: 'DRV-BLR-042',
      vehicleCode: 'PR-VH-005',
    });

    const drvRoutes = [
      'http://localhost:5173/driver/current-delivery',
      'http://localhost:5173/driver/pickup',
      'http://localhost:5173/driver/route',
      'http://localhost:5173/driver/live-location',
      'http://localhost:5173/driver/dashboard',
      'http://localhost:5173/driver/deliveries',
      'http://localhost:5173/driver/vehicle',
      'http://localhost:5173/driver/history',
      'http://localhost:5173/driver/profile',
    ];

    for (const url of drvRoutes) {
      console.log(`  -> Navigating to: ${url}`);
      await send('Page.navigate', { url });
      await new Promise((r) => setTimeout(r, 1200));
    }

    // ── 3. CUSTOMER RUNTIME VERIFICATION ──
    console.log('\n[3/3] Testing Customer Portal (/customer/dashboard & notifications)...');
    await setSession(custAuth.data.token, {
      id: 'CUST-001',
      email: custAuth.data.email,
      name: custAuth.data.fullName || 'Shruti Sanjana',
      role: 'CUSTOMER',
    });

    const custRoutes = [
      'http://localhost:5173/customer/dashboard',
      'http://localhost:5173/customer/notifications',
      'http://localhost:5173/customer/shipments',
    ];

    for (const url of custRoutes) {
      console.log(`  -> Navigating to: ${url}`);
      await send('Page.navigate', { url });
      await new Promise((r) => setTimeout(r, 1200));
    }

    ws.close();
  } finally {
    chromeProc.kill();
  }

  console.log('\n======================================================');
  console.log('MULTI-PORTAL CDP VERIFICATION RESULTS');
  console.log('======================================================');
  console.log('Total Critical Console / React / Hook Errors:', criticalErrors.length);
  console.log('Total Network (>=400) Errors:', networkErrors.length);

  if (criticalErrors.length > 0) {
    console.error('\nFAILING ERRORS:');
    criticalErrors.forEach((e) => console.error(' *', e));
    process.exit(1);
  } else {
    console.log('\n✅ 100% SUCCESS: ZERO HOOK ERRORS, ZERO UPDATE LOOPS, ZERO 403 NOTIFICATION REQUESTS ACROSS ALL PORTALS!');
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Fatal CDP script error:', err);
  process.exit(1);
});
