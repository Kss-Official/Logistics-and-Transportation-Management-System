const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/shrut/.gemini/antigravity-ide/brain/9b776dcb-8671-460f-8588-2783a1ebf6ba';

function getTabs() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json/list', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function createTab() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json/new?http://localhost:5173/warehouse/login', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Connecting to Chrome CDP...');
  let tabs = await getTabs();
  let targetTab = tabs.find(t => t.type === 'page');
  if (!targetTab) {
    targetTab = await createTab();
  }

  const ws = new WebSocket(targetTab.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  console.log('Connected to target tab:', targetTab.url);

  let reqId = 1;
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = reqId++;
      const handler = (evt) => {
        const res = JSON.parse(evt.data);
        if (res.id === id) {
          ws.removeEventListener('message', handler);
          if (res.error) reject(res.error);
          else resolve(res.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1400,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  // Step 1: Login as Kolkata Warehouse Manager
  console.log('\n--- 1. Login as Kolkata Warehouse Manager ---');
  await send('Page.navigate', { url: 'http://localhost:5173/warehouse/login' });
  await new Promise(r => setTimeout(r, 1500));

  // Clear localStorage
  await send('Runtime.evaluate', { expression: 'localStorage.clear()' });
  await send('Page.navigate', { url: 'http://localhost:5173/warehouse/login' });
  await new Promise(r => setTimeout(r, 1500));

  // Type credentials and click submit
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const emailInput = document.querySelector('input[type="email"]') || document.querySelector('input[name="email"]');
        const passInput = document.querySelector('input[type="password"]') || document.querySelector('input[name="password"]');
        const submitBtn = document.querySelector('button[type="submit"]');

        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(emailInput, 'ccu.east@primeroute.com');
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));

        setter.call(passInput, 'Manager@2026!');
        passInput.dispatchEvent(new Event('input', { bubbles: true }));

        submitBtn.click();
      })()
    `
  });

  await new Promise(r => setTimeout(r, 2500));

  // Navigate to /warehouse/orders
  await send('Page.navigate', { url: 'http://localhost:5173/warehouse/orders' });
  await new Promise(r => setTimeout(r, 2000));

  // Check order text in DOM
  const kolkataDom = await send('Runtime.evaluate', {
    expression: `document.body.innerText`
  });

  const has76406402 = kolkataDom.result.value.includes('PR-ORD-76406402');
  const hasKolkataHub = kolkataDom.result.value.includes('Kolkata Eastern Corridor Hub') || kolkataDom.result.value.includes('WH-CCU-006');

  console.log(`Kolkata Manager Orders page contains PR-ORD-76406402: ${has76406402 ? 'YES (Verified)' : 'NO'}`);
  console.log(`Kolkata Manager page contains Kolkata Hub (WH-CCU-006): ${hasKolkataHub ? 'YES (Verified)' : 'NO'}`);

  // Screenshot Kolkata
  const kolkataShot = await send('Page.captureScreenshot', { format: 'png' });
  const kolkataPath = path.join(ARTIFACT_DIR, 'kolkata_warehouse_orders_verified.png');
  fs.writeFileSync(kolkataPath, Buffer.from(kolkataShot.data, 'base64'));
  console.log('Saved Kolkata Orders Screenshot:', kolkataPath);

  // Step 2: Login as Bengaluru Warehouse Manager
  console.log('\n--- 2. Login as Bengaluru Warehouse Manager ---');
  await send('Runtime.evaluate', { expression: 'localStorage.clear()' });
  await send('Page.navigate', { url: 'http://localhost:5173/warehouse/login' });
  await new Promise(r => setTimeout(r, 1500));

  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const emailInput = document.querySelector('input[type="email"]') || document.querySelector('input[name="email"]');
        const passInput = document.querySelector('input[type="password"]') || document.querySelector('input[name="password"]');
        const submitBtn = document.querySelector('button[type="submit"]');

        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(emailInput, 'priya@primeroute.com');
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));

        setter.call(passInput, 'Manager@2026!');
        passInput.dispatchEvent(new Event('input', { bubbles: true }));

        submitBtn.click();
      })()
    `
  });

  await new Promise(r => setTimeout(r, 2500));

  await send('Page.navigate', { url: 'http://localhost:5173/warehouse/orders' });
  await new Promise(r => setTimeout(r, 2000));

  const blrDom = await send('Runtime.evaluate', {
    expression: `document.body.innerText`
  });

  const blrHas76406402 = blrDom.result.value.includes('PR-ORD-76406402');
  const blrHasBlrHub = blrDom.result.value.includes('Bengaluru Central Hub') || blrDom.result.value.includes('WH-BLR-001');

  console.log(`Bengaluru Manager Orders page contains PR-ORD-76406402: ${blrHas76406402 ? 'YES (WRONG)' : 'NO (Properly Excluded)'}`);
  console.log(`Bengaluru Manager page contains Bengaluru Hub (WH-BLR-001): ${blrHasBlrHub ? 'YES (Verified)' : 'NO'}`);

  // Screenshot Bengaluru
  const blrShot = await send('Page.captureScreenshot', { format: 'png' });
  const blrPath = path.join(ARTIFACT_DIR, 'blr_warehouse_orders_verified.png');
  fs.writeFileSync(blrPath, Buffer.from(blrShot.data, 'base64'));
  console.log('Saved Bengaluru Orders Screenshot:', blrPath);

  ws.close();
}

main().catch(err => {
  console.error('CDP script error:', err);
  process.exit(1);
});
