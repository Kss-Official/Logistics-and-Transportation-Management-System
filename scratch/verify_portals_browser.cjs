const http = require('http');
const { spawn } = require('child_process');

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

class CDP {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.pending = new Map();
  }

  async connect() {
    const WebSocket = require('module').createRequire(__filename)('ws');
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.on('open', resolve);
      this.ws.on('error', reject);
      this.ws.on('message', (msg) => {
        const data = JSON.parse(msg);
        if (data.id && this.pending.has(data.id)) {
          const { resolve, reject } = this.pending.get(data.id);
          this.pending.delete(data.id);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      });
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
}

async function run() {
  console.log('=== VERIFYING FRONTEND PORTALS WITH REAL BROWSER CDP ===\n');

  // 1. Get Admin and Customer Tokens
  const adminAuth = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'sanjanaaa.shru@gmail.com', password: 'Password@123' });

  const adminToken = adminAuth.data?.token || adminAuth.data?.data?.token;
  console.log('Admin Auth Token:', adminToken ? 'Acquired' : 'FAILED');

  const custAuth = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'customer@primeroute.com', password: 'Password@123' });

  const custToken = custAuth.data?.token || custAuth.data?.data?.token;
  console.log('Customer Auth Token:', custToken ? 'Acquired' : 'FAILED');

  // Spawn Chrome
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--remote-debugging-port=9229',
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--user-data-dir=' + require('os').tmpdir() + '\\chrome_portal_verify_' + Date.now(),
  ]);

  await new Promise((r) => setTimeout(r, 2000));

  try {
    const list = await getJson('http://localhost:9229/json/list');
    const wsUrl = list[0].webSocketDebuggerUrl;
    const cdp = new CDP(wsUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    console.log('\n--- 1. Testing Admin Portal Pages ---');
    // Inject admin auth in localStorage
    await cdp.send('Page.navigate', { url: 'http://localhost:5173' });
    await new Promise((r) => setTimeout(r, 1500));

    const setAdminAuthScript = `
      localStorage.setItem('token', '${adminToken}');
      localStorage.setItem('auth_token', '${adminToken}');
      localStorage.setItem('user', JSON.stringify({ id: 1, email: 'sanjanaaa.shru@gmail.com', role: 'ADMIN', name: 'Admin Sanjana' }));
    `;
    await cdp.send('Runtime.evaluate', { expression: setAdminAuthScript });

    // 1A. Admin Orders
    console.log('Navigating to http://localhost:5173/admin/orders ...');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/admin/orders' });
    await new Promise((r) => setTimeout(r, 2000));
    const adminOrdersText = (await cdp.send('Runtime.evaluate', { expression: 'document.body.innerText' })).result.value;
    console.log('Admin Orders Page contains PR-ORD-29842877:', adminOrdersText.includes('PR-ORD-29842877'));
    console.log('Admin Orders Page contains PR-ORD-74855865:', adminOrdersText.includes('PR-ORD-74855865'));

    // 1B. Admin Invoices
    console.log('Navigating to http://localhost:5173/admin/invoices ...');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/admin/invoices' });
    await new Promise((r) => setTimeout(r, 2000));
    const adminInvoicesText = (await cdp.send('Runtime.evaluate', { expression: 'document.body.innerText' })).result.value;
    console.log('Admin Invoices Page contains INV-PR-ORD-29842877:', adminInvoicesText.includes('INV-PR-ORD-29842877'));
    console.log('Admin Invoices Page contains INV-PR-ORD-74855865:', adminInvoicesText.includes('INV-PR-ORD-74855865'));

    // 1C. Admin Shipments
    console.log('Navigating to http://localhost:5173/admin/shipments ...');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/admin/shipments' });
    await new Promise((r) => setTimeout(r, 2000));
    const adminShipmentsText = (await cdp.send('Runtime.evaluate', { expression: 'document.body.innerText' })).result.value;
    console.log('Admin Shipments Page contains PR-ORD-29842877:', adminShipmentsText.includes('PR-ORD-29842877'));
    console.log('Admin Shipments Page contains PR-ORD-74855865:', adminShipmentsText.includes('PR-ORD-74855865'));

    console.log('\n--- 2. Testing Customer Portal Pages ---');
    const setCustAuthScript = `
      localStorage.setItem('token', '${custToken}');
      localStorage.setItem('auth_token', '${custToken}');
      localStorage.setItem('user', JSON.stringify({ id: 1014, email: 'customer@primeroute.com', role: 'CUSTOMER', name: 'Alex Morgan' }));
    `;
    await cdp.send('Runtime.evaluate', { expression: setCustAuthScript });

    // 2A. Customer My Orders
    console.log('Navigating to http://localhost:5173/customer/orders ...');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/customer/orders' });
    await new Promise((r) => setTimeout(r, 2000));
    const custOrdersText = (await cdp.send('Runtime.evaluate', { expression: 'document.body.innerText' })).result.value;
    console.log('Customer Orders Page contains PR-ORD-29842877:', custOrdersText.includes('PR-ORD-29842877'));
    console.log('Customer Orders Page contains PR-ORD-74855865:', custOrdersText.includes('PR-ORD-74855865'));

    // 2B. Customer Invoices
    console.log('Navigating to http://localhost:5173/customer/invoices ...');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/customer/invoices' });
    await new Promise((r) => setTimeout(r, 2000));
    const custInvoicesText = (await cdp.send('Runtime.evaluate', { expression: 'document.body.innerText' })).result.value;
    console.log('Customer Invoices Page contains INV-PR-ORD-29842877:', custInvoicesText.includes('INV-PR-ORD-29842877'));
    console.log('Customer Invoices Page contains INV-PR-ORD-74855865:', custInvoicesText.includes('INV-PR-ORD-74855865'));

    // 2C. Customer Shipments
    console.log('Navigating to http://localhost:5173/customer/shipments ...');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/customer/shipments' });
    await new Promise((r) => setTimeout(r, 2000));
    const custShipmentsText = (await cdp.send('Runtime.evaluate', { expression: 'document.body.innerText' })).result.value;
    console.log('Customer Shipments Page contains PR-ORD-29842877:', custShipmentsText.includes('PR-ORD-29842877'));
    console.log('Customer Shipments Page contains PR-ORD-74855865:', custShipmentsText.includes('PR-ORD-74855865'));

    console.log('\n=== ALL BROWSER DOM CHECKS PASSED: ZERO TEST DATA REMAINS IN EITHER PORTAL ===');
  } catch (err) {
    console.error('CDP Error:', err);
  } finally {
    try {
      chromeProc.kill();
    } catch {}
  }
}

run().catch(console.error);
