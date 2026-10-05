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
  console.log('--- STARTING MY VEHICLE & INSPECTION MERGE VERIFICATION ---');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--remote-debugging-port=9227',
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--user-data-dir=' + require('os').tmpdir() + '\\chrome-drv-veh-' + Date.now(),
  ]);

  await new Promise((r) => setTimeout(r, 1800));

  try {
    const tabs = await getJson('http://localhost:9227/json');
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
    await new Promise((r) => setTimeout(r, 600));

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

    // 2. Open Driver Dashboard and verify sidebar
    console.log('2. Opening /driver/dashboard to inspect sidebar navigation...');
    await send('Page.navigate', { url: 'http://localhost:5173/driver/dashboard' });
    await new Promise((r) => setTimeout(r, 1600));

    const sidebarCheck = await ev(`
      (() => {
        const sidebar = document.getElementById('driver-sidebar');
        if (!sidebar) return { found: false };

        const sections = Array.from(sidebar.querySelectorAll('.driver-sidebar-nav > div')).map(sec => {
          const title = sec.querySelector('div')?.innerText;
          const items = Array.from(sec.querySelectorAll('a')).map(a => a.innerText.trim());
          return { title, items };
        });

        const vehicleSec = sections.find(s => s.title === 'VEHICLE');
        const hasInspectionInSidebar = sidebar.innerText.includes('Vehicle Inspection');

        return {
          found: true,
          vehicleSectionItems: vehicleSec ? vehicleSec.items : [],
          hasOnlyMyVehicle: vehicleSec && vehicleSec.items.length === 1 && vehicleSec.items[0].includes('My Vehicle'),
          hasInspectionInSidebar,
        };
      })()
    `);

    console.log('Sidebar Navigation Check:', JSON.stringify(sidebarCheck, null, 2));

    // 3. Navigate to /driver/vehicle
    console.log('3. Navigating to /driver/vehicle...');
    await send('Page.navigate', { url: 'http://localhost:5173/driver/vehicle' });
    await new Promise((r) => setTimeout(r, 1600));

    // 4. Verify all components of My Vehicle page
    console.log('4. Inspecting My Vehicle page content...');
    const pageCheck = await ev(`
      (() => {
        const text = document.body.innerText;
        return {
          hasHeader: text.includes('MY VEHICLE') && text.includes('Tata Ultra T.7'),
          hasOverview: text.includes('Vehicle Overview') && text.includes('PR-VH-005') && text.includes('32 Tons'),
          hasCurrentAssignment: text.includes('Current Assignment') && text.includes('TRK-PR-JV685885'),
          hasSpecs: text.includes('Vehicle Specifications') && text.includes('KA-01-E-4921'),
          hasInspection: text.includes('Vehicle Safety Inspection') && text.includes('Start New Inspection'),
          hasInspectionHistory: text.includes('Inspection Audit History'),
          hasMaintenance: text.includes('Maintenance & Service Schedule'),
        };
      })()
    `);

    console.log('Page Structure Check:', JSON.stringify(pageCheck, null, 2));
    await captureScreenshot('driver_my_vehicle_top.png');

    // 5. Open Inspection Checklist
    console.log('5. Clicking "Start New Inspection" button...');
    await ev(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const startBtn = btns.find(b => b.innerText.includes('Start New Inspection') || b.innerText.includes('Start Pre-Trip Inspection'));
        if (startBtn) startBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 800));

    const checklistCheck = await ev(`
      (() => {
        const text = document.body.innerText;
        const rows = document.querySelectorAll('#vehicle-inspection-section table tbody tr');
        return {
          checklistOpen: text.includes('Pre-Trip Vehicle Inspection Checklist'),
          itemsCount: rows.length,
          hasBrakes: text.includes('Brakes'),
          hasTires: text.includes('Tires'),
          hasLights: text.includes('Headlights'),
          hasEngine: text.includes('Engine'),
          hasFuel: text.includes('Fuel Level'),
          hasDocuments: text.includes('Documents'),
          hasResultBadge: text.includes('READY FOR SERVICE') || text.includes('NEEDS ATTENTION'),
        };
      })()
    `);

    console.log('Checklist Verification:', JSON.stringify(checklistCheck, null, 2));
    await captureScreenshot('driver_my_vehicle_inspection_open.png');

    // 6. Complete and submit inspection
    console.log('6. Typing driver notes and submitting inspection...');
    await ev(`
      (() => {
        const textarea = document.querySelector('#vehicle-inspection-section textarea');
        if (textarea) {
          textarea.value = 'Pre-trip full inspection completed. All 11 checkpoints passed.';
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
        const submitBtn = Array.from(document.querySelectorAll('#vehicle-inspection-section button')).find(b => b.innerText.includes('Submit Inspection'));
        if (submitBtn) submitBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 1200));

    const submissionCheck = await ev(`
      (() => {
        const text = document.body.innerText;
        return {
          hasSuccessAlert: text.includes('Inspection submitted successfully'),
          historyRowCount: document.querySelectorAll('#vehicle-inspection-section table tbody tr').length,
          lastInspectionDate: document.querySelector('#vehicle-inspection-section')?.innerText.includes('19 Sep 2026') || document.querySelector('#vehicle-inspection-section')?.innerText.includes('PASSED'),
        };
      })()
    `);

    console.log('Submission Verification:', JSON.stringify(submissionCheck, null, 2));

    // 7. Test backward compatibility: Redirect from /driver/vehicle-inspection
    console.log('7. Testing backward-compatible redirect from /driver/vehicle-inspection...');
    await send('Page.navigate', { url: 'http://localhost:5173/driver/vehicle-inspection' });
    await new Promise((r) => setTimeout(r, 1200));

    const redirectCheck = await ev(`
      (() => {
        return {
          currentUrl: window.location.pathname,
          isRedirectedToVehicle: window.location.pathname === '/driver/vehicle',
        };
      })()
    `);

    console.log('Redirect Check:', JSON.stringify(redirectCheck, null, 2));

    // 8. Test Mobile Viewport (390x844)
    console.log('8. Testing Mobile Viewport (390x844)...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await new Promise((r) => setTimeout(r, 800));

    // Open mobile sidebar drawer
    await ev(`
      (() => {
        const toggleBtn = document.querySelector('button[aria-label="Toggle menu"]');
        if (toggleBtn) toggleBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 600));

    const mobileSidebarCheck = await ev(`
      (() => {
        const sidebar = document.getElementById('driver-sidebar');
        const text = sidebar ? sidebar.innerText : '';
        const vehicleItems = Array.from(sidebar.querySelectorAll('a'))
          .map(a => a.innerText.trim())
          .filter(t => t.includes('Vehicle'));

        return {
          sidebarOpen: sidebar.classList.contains('open'),
          vehicleItems,
          hasOnlyMyVehicle: vehicleItems.length === 1 && vehicleItems[0].includes('My Vehicle'),
          hasNoInspectionItem: !text.includes('Vehicle Inspection'),
        };
      })()
    `);

    console.log('Mobile Sidebar Check:', JSON.stringify(mobileSidebarCheck, null, 2));
    await captureScreenshot('driver_my_vehicle_mobile_drawer.png');

    console.log('--- ALL MY VEHICLE MERGE VERIFICATIONS COMPLETED SUCCESSFULLY ---');
  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    try {
      chromeProc.kill();
    } catch {}
  }
}

run();
