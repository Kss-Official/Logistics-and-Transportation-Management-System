const http = require('http');
const { spawn } = require('child_process');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
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
      const data = JSON.parse(event.data);
      if (data.id && this.callbacks.has(data.id)) {
        const { resolve, reject } = this.callbacks.get(data.id);
        this.callbacks.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
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
    return res.result ? res.result.value : undefined;
  }
}

async function run() {
  console.log('--- Starting Chrome for Comprehensive Logout Testing ---');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    'about:blank',
  ]);

  let connected = false;
  let targets;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      targets = await httpGet('http://localhost:9222/json');
      if (targets && targets.length > 0) {
        connected = true;
        break;
      }
    } catch {}
  }

  if (!connected) {
    console.error('Failed to connect to Chrome CDP.');
    chromeProcess.kill();
    process.exit(1);
  }

  const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
  const cdp = new SimpleCDP(pageTarget.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  const testResults = [];

  // Helper to establish authenticated session using real Spring Boot JWT
  async function establishAuth(email, password, destination) {
    const loginData = await apiLogin(email, password);
    if (!loginData.token) {
      throw new Error(`Failed to login ${email}: ${JSON.stringify(loginData)}`);
    }

    const role = loginData.role.replace('ROLE_', '');
    const userObj = {
      id: '',
      email: loginData.email,
      name: loginData.fullName || 'User',
      initials: 'PR',
      role: role,
      roleTitle: role,
      warehouseCode: loginData.warehouseCode || null,
      warehouseId: loginData.warehouseId || null,
      warehouseName: loginData.warehouseName || null,
    };

    await cdp.send('Page.navigate', { url: 'http://localhost:5173/' });
    await sleep(600);

    await cdp.eval(`
      localStorage.setItem('auth_token', ${JSON.stringify(loginData.token)});
      localStorage.setItem('auth_user', ${JSON.stringify(JSON.stringify(userObj))});
      localStorage.setItem('primeroute_orders', JSON.stringify([{ id: 'ORD-TEST-1', status: 'PENDING' }]));
    `);

    // Navigate to protected destination
    await cdp.send('Page.navigate', { url: 'http://localhost:5173' + destination });
    await sleep(1500);
  }

  async function verifyStorageCleaned() {
    return await cdp.eval(`
      ({
        hasAuthToken: !!localStorage.getItem('auth_token') || !!sessionStorage.getItem('auth_token'),
        hasAuthUser: !!localStorage.getItem('auth_user') || !!sessionStorage.getItem('auth_user'),
        hasOrders: !!localStorage.getItem('primeroute_orders')
      })
    `);
  }

  // ── TEST 1: CUSTOMER PORTAL SIDEBAR LOGOUT ─────────────────────────
  console.log('\n[TEST 1] Testing Customer Portal Sidebar Logout...');
  await establishAuth('customer@primeroute.com', 'customer123', '/customer/dashboard');
  let currentUrl = await cdp.eval('window.location.href');
  console.log('Customer Dashboard URL:', currentUrl);

  await cdp.eval(`
    const btn = document.getElementById('sidebar-logout-btn');
    if (btn) btn.click();
  `);
  await sleep(1000);

  currentUrl = await cdp.eval('window.location.href');
  let bodyText = await cdp.eval('document.body.innerText');
  let storage = await verifyStorageCleaned();

  const test1Pass =
    currentUrl === 'http://localhost:5173/' &&
    bodyText.includes('Connecting Businesses') &&
    !storage.hasAuthToken &&
    !storage.hasAuthUser &&
    storage.hasOrders;

  console.log('Post-Logout URL:', currentUrl);
  console.log('Auth storage cleared:', !storage.hasAuthToken && !storage.hasAuthUser);
  console.log('Non-auth storage preserved:', storage.hasOrders);
  console.log('Landing page verified:', bodyText.includes('Connecting Businesses'));
  console.log('TEST 1 Result:', test1Pass ? 'PASSED' : 'FAILED');
  testResults.push({ name: '1. Customer Portal Sidebar Logout', passed: test1Pass, url: currentUrl });

  // ── TEST 2: ADMIN PORTAL SIDEBAR LOGOUT ───────────────────────────
  console.log('\n[TEST 2] Testing Admin Portal Sidebar Logout...');
  await establishAuth('sanjanaaa.shru@gmail.com', 'Sanjana@102026', '/admin/dashboard');
  currentUrl = await cdp.eval('window.location.href');
  console.log('Admin Dashboard URL:', currentUrl);

  await cdp.eval(`
    const btn = document.getElementById('sidebar-logout-btn');
    if (btn) btn.click();
  `);
  await sleep(1000);

  currentUrl = await cdp.eval('window.location.href');
  bodyText = await cdp.eval('document.body.innerText');
  storage = await verifyStorageCleaned();

  const test2Pass =
    currentUrl === 'http://localhost:5173/' &&
    bodyText.includes('Connecting Businesses') &&
    !storage.hasAuthToken &&
    !storage.hasAuthUser;

  console.log('Post-Logout URL:', currentUrl);
  console.log('TEST 2 Result:', test2Pass ? 'PASSED' : 'FAILED');
  testResults.push({ name: '2. Admin Portal Sidebar Logout', passed: test2Pass, url: currentUrl });

  // ── TEST 3: WAREHOUSE MANAGER SIDEBAR LOGOUT ─────────────────────
  console.log('\n[TEST 3] Testing Warehouse Manager Sidebar Logout...');
  await establishAuth('priya@primeroute.com', 'Manager@2026!', '/warehouse/dashboard');
  currentUrl = await cdp.eval('window.location.href');
  console.log('Warehouse Dashboard URL:', currentUrl);

  await cdp.eval(`
    const btn = document.getElementById('warehouse-logout-btn');
    if (btn) btn.click();
  `);
  await sleep(1000);

  currentUrl = await cdp.eval('window.location.href');
  bodyText = await cdp.eval('document.body.innerText');
  storage = await verifyStorageCleaned();

  const test3Pass =
    currentUrl === 'http://localhost:5173/' &&
    bodyText.includes('Connecting Businesses') &&
    !storage.hasAuthToken &&
    !storage.hasAuthUser;

  console.log('Post-Logout URL:', currentUrl);
  console.log('TEST 3 Result:', test3Pass ? 'PASSED' : 'FAILED');
  testResults.push({ name: '3. Warehouse Manager Sidebar Logout', passed: test3Pass, url: currentUrl });

  // ── TEST 4: CENTRALIZED LOGOUT / EXPIRATION HANDLER ─────────────
  console.log('\n[TEST 4] Testing Centralized AuthContext Logout / Expiration...');
  await establishAuth('customer@primeroute.com', 'customer123', '/customer/dashboard');
  currentUrl = await cdp.eval('window.location.href');
  console.log('Before Logout URL:', currentUrl);

  // Dispatch auth:expired event which invokes the centralized logout handler
  await cdp.eval(`
    window.dispatchEvent(new CustomEvent('auth:expired'));
  `);
  await sleep(1000);

  currentUrl = await cdp.eval('window.location.href');
  bodyText = await cdp.eval('document.body.innerText');
  storage = await verifyStorageCleaned();

  const test4Pass =
    currentUrl === 'http://localhost:5173/' &&
    bodyText.includes('Connecting Businesses') &&
    !storage.hasAuthToken &&
    !storage.hasAuthUser;

  console.log('Post-Logout URL:', currentUrl);
  console.log('TEST 4 Result:', test4Pass ? 'PASSED' : 'FAILED');
  testResults.push({ name: '4. Centralized AuthContext Logout', passed: test4Pass, url: currentUrl });

  // ── TEST 5: WAREHOUSE PROFILE CONFIRMATION MODAL ──────────────────
  console.log('\n[TEST 5] Testing Warehouse Profile Modal Logout...');
  await establishAuth('priya@primeroute.com', 'Manager@2026!', '/warehouse/profile');
  currentUrl = await cdp.eval('window.location.href');
  console.log('Before Modal Logout URL:', currentUrl);

  // Click Terminate Session button (#sign-out-btn)
  await cdp.eval(`
    const termBtn = document.getElementById('sign-out-btn');
    if (termBtn) termBtn.click();
  `);
  await sleep(500);

  // Click Sign Out Now button inside modal
  await cdp.eval(`
    const btns = Array.from(document.querySelectorAll('button'));
    const confirmBtn = btns.find(b => b.innerText && b.innerText.includes('Sign Out Now'));
    if (confirmBtn) confirmBtn.click();
  `);
  await sleep(1000);

  currentUrl = await cdp.eval('window.location.href');
  bodyText = await cdp.eval('document.body.innerText');
  storage = await verifyStorageCleaned();

  const test5Pass =
    currentUrl === 'http://localhost:5173/' &&
    bodyText.includes('Connecting Businesses') &&
    !storage.hasAuthToken &&
    !storage.hasAuthUser;

  console.log('Post-Logout URL:', currentUrl);
  console.log('TEST 5 Result:', test5Pass ? 'PASSED' : 'FAILED');
  testResults.push({ name: '5. Warehouse Profile Modal Logout', passed: test5Pass, url: currentUrl });

  // ── TEST 6: PROTECTED ROUTE MANUAL ENTRY (AFTER LOGOUT) ───────────
  console.log('\n[TEST 6] Testing manual entry to protected routes while logged out...');
  await cdp.send('Page.navigate', { url: 'http://localhost:5173/warehouse/dashboard' });
  await sleep(1200);
  const whUrl = await cdp.eval('window.location.href');

  await cdp.send('Page.navigate', { url: 'http://localhost:5173/admin/dashboard' });
  await sleep(1200);
  const adminUrl = await cdp.eval('window.location.href');

  await cdp.send('Page.navigate', { url: 'http://localhost:5173/customer/dashboard' });
  await sleep(1200);
  const custUrl = await cdp.eval('window.location.href');

  const test6Pass =
    whUrl.includes('/signin/warehouse') &&
    adminUrl.includes('/signin/admin') &&
    custUrl.includes('/signin/customer');

  console.log('/warehouse/dashboard redirected to:', whUrl);
  console.log('/admin/dashboard redirected to:', adminUrl);
  console.log('/customer/dashboard redirected to:', custUrl);
  console.log('TEST 6 Result:', test6Pass ? 'PASSED' : 'FAILED');
  testResults.push({ name: '6. Protected Route Direct URL Redirection', passed: test6Pass });

  // ── TEST 7: BROWSER BACK BUTTON SAFETY ───────────────────────────
  console.log('\n[TEST 7] Testing Browser Back button after logout...');
  await establishAuth('customer@primeroute.com', 'customer123', '/customer/orders');
  await sleep(800);
  await cdp.send('Page.navigate', { url: 'http://localhost:5173/customer/dashboard' });
  await sleep(800);

  // Logout
  await cdp.eval(`
    const btn = document.getElementById('sidebar-logout-btn');
    if (btn) btn.click();
  `);
  await sleep(1000);

  // Press browser back
  await cdp.eval('history.back()');
  await sleep(1200);

  currentUrl = await cdp.eval('window.location.href');
  bodyText = await cdp.eval('document.body.innerText');
  const isProtectedExposed = bodyText.includes('Active Shipments') || bodyText.includes('Manage Orders');
  const test7Pass = !isProtectedExposed;

  console.log('Browser Back URL:', currentUrl);
  console.log('Protected content exposed:', isProtectedExposed);
  console.log('TEST 7 Result:', test7Pass ? 'PASSED' : 'FAILED');
  testResults.push({ name: '7. Browser Back Protected Content Security', passed: test7Pass });

  console.log('\n========================================');
  console.log('FINAL AUTOMATED TEST REPORT:');
  console.log('========================================');
  console.table(testResults);

  chromeProcess.kill();
  process.exit(testResults.every((t) => t.passed) ? 0 : 1);
}

run().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
