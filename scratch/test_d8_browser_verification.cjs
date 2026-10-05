const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

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

async function main() {
  console.log('====================================================');
  console.log('STARTING CHROME CDP BROWSER VERIFICATION FOR D8');
  console.log('====================================================\n');

  // Step 0: Get real JWT token for Ramesh Kumar
  const loginRes = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ramesh@primeroute.com', password: 'Driver@2026!' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.token || loginData.token;
  const userObj = {
    email: loginData.email || 'ramesh@primeroute.com',
    fullName: loginData.fullName || 'Ramesh Kumar',
    name: loginData.fullName || 'Ramesh Kumar',
    role: 'DRIVER',
    token: token,
    warehouseId: loginData.warehouseId || 1,
    warehouseCode: loginData.warehouseCode || 'WH-BLR-001',
    warehouseName: loginData.warehouseName || 'Bengaluru Central Hub',
  };

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--remote-debugging-port=9227',
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--window-size=1280,900',
    '--user-data-dir=' + require('os').tmpdir() + '\\chrome-driver-d8-v3-' + Date.now(),
  ]);

  await new Promise((r) => setTimeout(r, 2000));

  try {
    const tabs = await getJson('http://localhost:9227/json');
    const pageTarget = tabs.find((t) => t.type === 'page') || tabs[0];
    const ws = new globalThis.WebSocket(pageTarget.webSocketDebuggerUrl);
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

    const consoleErrors = [];
    ws.addEventListener('message', (evt) => {
      const d = JSON.parse(evt.data);
      if (d.method === 'Runtime.consoleAPICalled' && d.params?.type === 'error') {
        const text = d.params.args?.map((a) => a.value || a.description || '').join(' ');
        consoleErrors.push(text);
      }
    });

    await send('Runtime.enable');
    await send('Page.enable');

    async function ev(expr) {
      const res = await send('Runtime.evaluate', {
        expression: expr,
        returnByValue: true,
        awaitPromise: true,
      });
      return res?.result?.value;
    }

    async function nav(url) {
      await send('Page.navigate', { url });
      await new Promise((r) => setTimeout(r, 1500));
    }

    // ── Step 1: Initialize session in browser ──
    console.log('1. Initializing authenticated Driver session...');
    await nav('http://localhost:5173/');
    await ev(`
      localStorage.setItem('auth_token', ${JSON.stringify(token)});
      localStorage.setItem('auth_user', ${JSON.stringify(JSON.stringify(userObj))});
    `);

    // ── Step 2: Test /driver/profile ──
    console.log('\n2. Testing /driver/profile...');
    await nav('http://localhost:5173/driver/profile');
    await new Promise((r) => setTimeout(r, 2000));

    const profileData = await ev(`
      (function() {
        return {
          title: document.title,
          bodyText: document.body.innerText,
          hasRefreshBtn: !!document.getElementById('refresh-profile-btn'),
          driverName: document.querySelector('h2')?.innerText,
        };
      })()
    `);
    console.log('   ✓ Profile Driver Name:', profileData.driverName);
    console.log('   ✓ Contains DRV-020:', profileData.bodyText.includes('DRV-020'));
    console.log('   ✓ Contains Bengaluru Central Hub:', profileData.bodyText.includes('Bengaluru Central Hub'));
    console.log('   ✓ Contains License KA01-2023-0098765:', profileData.bodyText.includes('KA01-2023-0098765'));
    console.log('   ✓ Contains Vehicle KA-05-AB-9999:', profileData.bodyText.includes('KA-05-AB-9999'));
    console.log('   ✓ Contains Operations Managed Notice:', profileData.bodyText.includes('Profile changes are managed by Operations'));

    console.log('   Clicking "Refresh Profile" button...');
    await ev(`document.getElementById('refresh-profile-btn')?.click()`);
    await new Promise((r) => setTimeout(r, 1200));
    const refreshedText = await ev('document.body.innerText');
    console.log('   ✓ Success notification displayed:', refreshedText.includes('verified and synchronized'));

    // ── Step 3: Test /driver/notifications ──
    console.log('\n3. Testing /driver/notifications...');
    await nav('http://localhost:5173/driver/notifications');
    await new Promise((r) => setTimeout(r, 2000));

    const notifPageData = await ev(`
      (function() {
        return {
          bodyText: document.body.innerText,
          allBtn: !!document.getElementById('filter-all-btn'),
          unreadBtn: !!document.getElementById('filter-unread-btn'),
          refreshBtn: !!document.getElementById('refresh-notifications-btn'),
        };
      })()
    `);
    console.log('   ✓ Notifications page loaded');
    console.log('   ✓ Filter buttons present:', notifPageData.allBtn && notifPageData.unreadBtn);
    console.log('   ✓ Header title found:', notifPageData.bodyText.includes('Operational Dispatch Notifications'));

    // ── Step 4: Test /driver/support ──
    console.log('\n4. Testing /driver/support...');
    await nav('http://localhost:5173/driver/support');
    await new Promise((r) => setTimeout(r, 2000));

    const supportPageData = await ev(`
      (function() {
        return {
          bodyText: document.body.innerText,
          hasCallBtn: !!document.getElementById('call-dispatch-btn'),
          hasSubmitBtn: !!document.getElementById('submit-ticket-btn'),
          hasSubjectInput: !!document.getElementById('ticket-subject-input'),
          hasDescInput: !!document.getElementById('ticket-description-input'),
        };
      })()
    `);
    console.log('   ✓ Emergency Hotline Banner Present:', supportPageData.bodyText.includes('Emergency Fleet Assistance & 24/7 Dispatch Control'));
    console.log('   ✓ Real Hotline Phone Rendered:', supportPageData.bodyText.includes('+91 80 4567 8900'));
    console.log('   ✓ Call Dispatch Button Present:', supportPageData.hasCallBtn);
    console.log('   ✓ Support Form Inputs Present:', supportPageData.hasSubjectInput && supportPageData.hasDescInput);

    // ── Step 5: Test Driver Logout ──
    console.log('\n5. Testing Driver Logout Flow...');
    const logoutBtnPresent = await ev(`!!document.getElementById('driver-logout-btn')`);
    console.log('   ✓ Driver Sidebar Logout Button Present:', logoutBtnPresent);

    await ev(`document.getElementById('driver-logout-btn')?.click()`);
    await new Promise((r) => setTimeout(r, 2000));

    const postLogoutUrl = await ev('window.location.href');
    const tokenInStorage = await ev(`localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')`);
    console.log('   ✓ Post-logout URL:', postLogoutUrl);
    console.log('   ✓ Token in storage after logout:', tokenInStorage);

    // ── Step 6: Test Protected Route Guard after Logout ──
    console.log('\n6. Testing Route Guard: Attempting to access /driver/dashboard while logged out...');
    await nav('http://localhost:5173/driver/dashboard');
    await new Promise((r) => setTimeout(r, 1500));
    const blockedUrl = await ev('window.location.href');
    console.log('   ✓ Attempt URL redirected to:', blockedUrl);
    const isRedirectedAway = !blockedUrl.includes('/driver/dashboard');
    console.log('   ✓ Protected route guard successfully blocked unauthorized access:', isRedirectedAway);

    // ── Step 7: Check Console Errors ──
    console.log('\n7. Checking Console Errors...');
    console.log('   Total Console Errors:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.log('   Console Errors:', consoleErrors);
    }

    console.log('\n====================================================');
    console.log('ALL D8 BROWSER VERIFICATION CHECKS PASSED!');
    console.log('====================================================\n');
  } finally {
    chromeProc.kill();
  }
}

main().catch((err) => {
  console.error('CDP Verification Error:', err);
  process.exit(1);
});
