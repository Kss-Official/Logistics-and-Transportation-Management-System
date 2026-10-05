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

async function run() {
  console.log('======================================================');
  console.log('DRIVER PORTAL RUNTIME VERIFICATION (BROWSER + CONSOLE)');
  console.log('======================================================\n');

  // 1. Authenticate Ramesh Driver via live backend
  console.log('Step 1: Authenticating ramesh@primeroute.com...');
  const authRes = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'ramesh@primeroute.com', password: 'Driver@2026!' });

  if (authRes.status !== 200 || !authRes.data?.token) {
    console.error('Authentication failed!', authRes);
    process.exit(1);
  }

  const token = authRes.data.token;
  const user = {
    id: 'DRV-001',
    email: authRes.data.email,
    name: authRes.data.fullName || 'Ramesh Kumar',
    role: 'DRIVER',
    driverCode: 'DRV-BLR-042',
    vehicleCode: 'PR-VH-005',
  };
  console.log('Authenticated successfully as ROLE_DRIVER! Token length:', token.length);

  // 2. Launch headless Chrome with CDP
  console.log('\nStep 2: Launching Chrome with CDP port 9225...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--remote-debugging-port=9225',
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--user-data-dir=' + require('os').tmpdir() + '\\chrome-driver-verify-' + Date.now(),
  ]);

  await new Promise((r) => setTimeout(r, 2000));

  const consoleErrors = [];
  const consoleWarnings = [];
  const networkErrors = [];

  try {
    const tabs = await getJson('http://localhost:9225/json');
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

    // Attach listeners for console and exceptions
    ws.addEventListener('message', (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const type = msg.params.type;
        const text = msg.params.args.map((a) => a.value || a.description || JSON.stringify(a)).join(' ');
        if (type === 'error') {
          consoleErrors.push(text);
          console.error(`  [BROWSER ERROR] ${text}`);
        } else if (type === 'warning') {
          consoleWarnings.push(text);
        }
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        const desc = msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text;
        consoleErrors.push(desc);
        console.error(`  [BROWSER EXCEPTION] ${desc}`);
      }
      if (msg.method === 'Network.responseReceived') {
        const status = msg.params.response?.status;
        const url = msg.params.response?.url;
        if (status >= 400) {
          networkErrors.push(`${status} ${url}`);
          console.warn(`  [NETWORK ERROR ${status}] ${url}`);
        }
      }
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');

    // Seed token into browser storage
    console.log('\nStep 3: Initializing Driver authentication session in browser...');
    await send('Page.navigate', { url: 'http://localhost:5173/signin/driver' });
    await new Promise((r) => setTimeout(r, 1200));

    await send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('auth_token', ${JSON.stringify(token)});
        localStorage.setItem('auth_user', ${JSON.stringify(JSON.stringify(user))});
        sessionStorage.setItem('auth_token', ${JSON.stringify(token)});
        sessionStorage.setItem('auth_user', ${JSON.stringify(JSON.stringify(user))});
      `,
    });

    // Routes to verify
    const routes = [
      '/driver/dashboard',
      '/driver/deliveries',
      '/driver/current-delivery',
      '/driver/pickup',
      '/driver/route',
      '/driver/live-location',
      '/driver/vehicle',
      '/driver/history',
      '/driver/notifications',
      '/driver/profile',
      '/driver/support',
    ];

    console.log('\nStep 4: Testing Driver Portal Navigation across all routes...');
    for (const route of routes) {
      console.log(`\nTesting route: ${route}`);
      const errCountBefore = consoleErrors.length;
      await send('Page.navigate', { url: `http://localhost:5173${route}` });
      await new Promise((r) => setTimeout(r, 1500));

      const pageState = await send('Runtime.evaluate', {
        expression: `({
          url: window.location.pathname,
          title: document.title,
          heading: document.querySelector('h1, h2, h3')?.innerText,
          bodyLength: document.body.innerText.length
        })`,
        returnByValue: true,
      });

      const errCountAfter = consoleErrors.length;
      const newErrors = errCountAfter - errCountBefore;
      if (newErrors === 0) {
        console.log(`  ✓ Route ${route} rendered cleanly. Heading: "${pageState.result.value?.heading || ''}" (Content len: ${pageState.result.value?.bodyLength})`);
      } else {
        console.error(`  ✗ Route ${route} encountered ${newErrors} errors!`);
      }
    }

    console.log('\n======================================================');
    console.log('SUMMARY RESULTS:');
    console.log(`Total Browser Errors: ${consoleErrors.length}`);
    console.log(`Total Network >=400: ${networkErrors.length}`);
    console.log('======================================================');

    const hasLoop = consoleErrors.some((e) => e.includes('Maximum update depth'));
    const has403Notif = networkErrors.some((e) => e.includes('/notifications') && e.includes('403'));
    const hasJsonErr = consoleErrors.some((e) => e.includes('Unexpected end of JSON input'));

    console.log(`- Maximum update depth exceeded: ${hasLoop ? 'FAILED' : 'CLEARED (0 occurrences)'}`);
    console.log(`- Customer notification 403 Forbidden: ${has403Notif ? 'FAILED' : 'CLEARED (0 occurrences)'}`);
    console.log(`- Unexpected end of JSON input: ${hasJsonErr ? 'FAILED' : 'CLEARED (0 occurrences)'}`);

    ws.close();
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    chromeProc.kill();
  }
}

run();
