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
  console.log('=== REAL BROWSER CDP AUDIT FOR ADMIN ORDERS & INVOICES ===\n');

  const adminAuth = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'admin@primeroute.com', password: 'Password@123' });

  const token = adminAuth.data?.token;
  console.log('Admin Auth Token:', token ? 'Acquired' : 'FAILED');
  if (!token) process.exit(1);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--remote-debugging-port=9228',
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--user-data-dir=' + os.tmpdir() + '\\chrome-inv-verify-' + Date.now(),
  ]);

  await new Promise((r) => setTimeout(r, 2000));

  const consoleErrors = [];
  const networkErrors = [];

  try {
    const tabs = await getJson('http://localhost:9228/json');
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

    // Seed localStorage & sessionStorage auth
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise((r) => setTimeout(r, 1000));

    const userObj = {
      id: '21',
      email: 'admin@primeroute.com',
      name: 'PrimeRoute Operations Admin',
      initials: 'PR',
      role: 'ADMIN',
      roleTitle: 'Operations Admin'
    };

    await send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('auth_token', '${token}');
        localStorage.setItem('auth_user', JSON.stringify(${JSON.stringify(userObj)}));
        sessionStorage.setItem('auth_token', '${token}');
        sessionStorage.setItem('auth_user', JSON.stringify(${JSON.stringify(userObj)}));
      `
    });

    // 1. Visit /admin/orders
    console.log('1. Navigating to http://localhost:5173/admin/orders...');
    await send('Page.navigate', { url: 'http://localhost:5173/admin/orders' });
    await new Promise((r) => setTimeout(r, 3000));

    // Click "View" on the first order in table
    console.log('Opening Order Details Drawer...');
    const viewOrderRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const viewBtns = Array.from(document.querySelectorAll('table tbody tr button, table tbody tr a, table tbody tr [aria-label*="View" i]'));
          if (viewBtns.length > 0) {
            viewBtns[0].click();
            return { clicked: true, text: viewBtns[0].textContent?.trim() };
          }
          return { clicked: false, totalBtns: viewBtns.length };
        })()
      `,
      returnByValue: true
    });
    console.log('View Order Click:', viewOrderRes.result?.value);
    await new Promise((r) => setTimeout(r, 1200));

    // Inspect drawer content for invoice information
    const drawerInvoiceCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const text = document.body.innerText;
          return {
            hasInvoiceTitle: text.includes('Commercial Tax Invoice'),
            hasInvoiceNumber: text.includes('INV-PR-'),
            hasDownloadBtn: !!Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Download Invoice'))
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Order Details Drawer Invoice Check:', drawerInvoiceCheck.result?.value);

    // 2. Visit /admin/invoices
    console.log('\n2. Navigating to http://localhost:5173/admin/invoices...');
    await send('Page.navigate', { url: 'http://localhost:5173/admin/invoices' });
    await new Promise((r) => setTimeout(r, 2500));

    // Inspect summary metrics and rows count
    const invoicePageCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const rows = Array.from(document.querySelectorAll('table tbody tr'));
          const paginationText = Array.from(document.querySelectorAll('div, p, span')).find(el => el.textContent && el.textContent.includes('Showing') && el.textContent.includes('results'))?.textContent?.trim();
          return {
            visibleRowsCount: rows.length,
            paginationText: paginationText
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Admin Invoices Page Check (Page 1):', invoicePageCheck.result?.value);

    // Click Page 2 pagination button
    console.log('Navigating to Page 2 in pagination...');
    const page2Click = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const pageBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent && b.textContent.trim() === '2');
          if (pageBtns.length > 0) {
            pageBtns[0].click();
            return { clicked: true };
          }
          return { clicked: false };
        })()
      `,
      returnByValue: true
    });
    console.log('Page 2 Click:', page2Click.result?.value);
    await new Promise((r) => setTimeout(r, 1000));

    const page2RowsCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const rows = Array.from(document.querySelectorAll('table tbody tr'));
          const paginationText = Array.from(document.querySelectorAll('div, p, span')).find(el => el.textContent && el.textContent.includes('Showing') && el.textContent.includes('results'))?.textContent?.trim();
          return {
            page2RowsCount: rows.length,
            page2PaginationText: paginationText
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Admin Invoices Page Check (Page 2):', page2RowsCheck.result?.value);

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
