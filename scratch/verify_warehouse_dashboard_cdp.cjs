const http = require('http');

async function getCDPWebSocketURL() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json/version', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.webSocketDebuggerUrl);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('=== CDP BROWSER VERIFICATION FOR WAREHOUSE DASHBOARD ===\n');
  try {
    const wsUrl = await getCDPWebSocketURL();
    console.log('Connected to CDP at:', wsUrl);
    const WebSocket = require('ws');
    const ws = new WebSocket(wsUrl);

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const msgId = id++;
        const handler = (msg) => {
          const res = JSON.parse(msg);
          if (res.id === msgId) {
            ws.off('message', handler);
            resolve(res.result);
          }
        };
        ws.on('message', handler);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    await new Promise(r => ws.on('open', r));
    console.log('CDP WebSocket connection opened.');

    // 1. Get targets
    const { targetInfos } = await send('Target.getTargets');
    let target = targetInfos.find(t => t.type === 'page' && t.url.includes('localhost:5173'));
    let targetId = target ? target.targetId : targetInfos.find(t => t.type === 'page')?.targetId;

    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

    function sendSession(method, params = {}) {
      return new Promise((resolve) => {
        const msgId = id++;
        const handler = (msg) => {
          const res = JSON.parse(msg);
          if (res.id === msgId) {
            ws.off('message', handler);
            resolve(res.result);
          }
        };
        ws.on('message', handler);
        ws.send(JSON.stringify({ id: msgId, sessionId, method, params }));
      });
    }

    // Enable console & runtime
    await sendSession('Runtime.enable');
    await sendSession('Page.enable');

    console.log('Navigating to Warehouse Dashboard...');
    await sendSession('Page.navigate', { url: 'http://localhost:5173/warehouse/dashboard' });
    await new Promise(r => setTimeout(r, 2000));

    // Evaluate dashboard content
    const evalRes = await sendSession('Runtime.evaluate', {
      expression: `
        (() => {
          const text = document.body.innerText;
          return {
            title: document.title,
            url: window.location.href,
            bodySnippet: text.substring(0, 1000)
          };
        })()
      `,
      returnByValue: true
    });

    console.log('Dashboard Page Evaluation:', evalRes.result?.value);

    // Verify Refresh Data button click
    console.log('\nClicking "Refresh Data" button in Dashboard...');
    const clickRes = await sendSession('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Refresh Data'));
          if (btn) {
            btn.click();
            return 'CLICKED_REFRESH';
          }
          return 'REFRESH_BTN_NOT_FOUND';
        })()
      `,
      returnByValue: true
    });
    console.log('Refresh button action:', clickRes.result?.value);
    await new Promise(r => setTimeout(r, 1500));

    // Navigate to Outgoing Shipments
    console.log('\nNavigating to Outgoing Shipments...');
    await sendSession('Page.navigate', { url: 'http://localhost:5173/warehouse/shipments/outgoing' });
    await new Promise(r => setTimeout(r, 2000));

    const outgoingEval = await sendSession('Runtime.evaluate', {
      expression: `
        (() => {
          const rows = Array.from(document.querySelectorAll('table tbody tr')).map(r => {
            const cells = Array.from(r.querySelectorAll('td')).map(c => c.innerText.trim());
            return {
              tracking: cells[0],
              customer: cells[1],
              destination: cells[2],
              deliveryType: cells[3],
              assignedFleet: cells[4],
              stage: cells[5],
              action: cells[6]
            };
          });
          return {
            rowCount: rows.length,
            rows: rows
          };
        })()
      `,
      returnByValue: true
    });

    console.log('Outgoing Shipments Table from Browser:');
    console.log(JSON.stringify(outgoingEval.result?.value, null, 2));

    // Navigate back to Dashboard
    console.log('\nNavigating back to Dashboard...');
    await sendSession('Page.navigate', { url: 'http://localhost:5173/warehouse/dashboard' });
    await new Promise(r => setTimeout(r, 2000));

    const finalDashEval = await sendSession('Runtime.evaluate', {
      expression: `
        (() => {
          return {
            pageText: document.body.innerText.substring(0, 800)
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Final Dashboard snippet:', finalDashEval.result?.value);

    ws.close();
    console.log('\n✓ CDP Browser verification finished successfully.');
  } catch (err) {
    console.log('CDP verification note:', err.message);
  }
}

run();
