const http = require('http');

function post(path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw) });
        } catch (e) {
          resolve({ status: res.statusCode, data: raw });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw) });
        } catch (e) {
          resolve({ status: res.statusCode, data: raw });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTest() {
  console.log('=== E2E WAREHOUSE DASHBOARD STAGE COUNT VERIFICATION ===\n');

  console.log('1. Authenticating as Warehouse Manager Priya Sharma (priya@primeroute.com)...');
  const loginRes = await post('/api/auth/login', { email: 'priya@primeroute.com', password: 'Manager@2026!' });
  const token = loginRes.data?.token || loginRes.data?.data?.token;
  if (!token) {
    console.error('Authentication failed:', loginRes.data);
    process.exit(1);
  }
  console.log('✓ Successfully authenticated. JWT Token acquired.\n');

  console.log('2. Fetching Warehouse Dashboard data...');
  const dashRes = await get('/api/warehouse-manager/dashboard', token);
  const dash = dashRes.data?.data || dashRes.data;
  console.log('Dashboard Response counts:');
  console.log(`- Ready to Process:    ${dash.readyToProcessCount}`);
  console.log(`- Picking in Progress: ${dash.pickingCount}`);
  console.log(`- Packed Consignments: ${dash.packedCount}`);
  console.log(`- Ready for Dispatch:  ${dash.readyForDispatchCount}`);
  console.log(`- Outgoing Total:      ${dash.outgoingShipmentsCount}`);

  console.log('\n3. Fetching Outgoing Shipments list...');
  const outRes = await get('/api/warehouse-manager/shipments/outgoing', token);
  const outgoing = outRes.data?.data || outRes.data;
  console.log(`Total visible outgoing shipments: ${outgoing.length}`);

  let manualReady = 0;
  let manualPicking = 0;
  let manualPacked = 0;
  let manualDispatch = 0;

  outgoing.forEach(s => {
    console.log(`  [Shipment #${s.id}] Tracking: ${s.trackingNumber} | Stage: ${s.operationalStage} | Status: ${s.status}`);
    const stage = (s.operationalStage || 'READY_FOR_PROCESSING').toUpperCase();
    const status = (s.status || '').toUpperCase();
    if (status !== 'DELIVERED' && status !== 'CANCELLED' && status !== 'IN_TRANSIT' && status !== 'OUT_FOR_DELIVERY') {
      if (stage === 'READY_TO_PROCESS' || stage === 'READY_FOR_PROCESSING') manualReady++;
      else if (stage === 'PICKING') manualPicking++;
      else if (stage === 'PACKED') manualPacked++;
      else if (stage === 'READY_FOR_DISPATCH') manualDispatch++;
    }
  });

  console.log('\nManual Breakdown of In-Warehouse Active Queue:');
  console.log(`- Ready to Process:    ${manualReady}`);
  console.log(`- Picking in Progress: ${manualPicking}`);
  console.log(`- Packed Consignments: ${manualPacked}`);
  console.log(`- Ready for Dispatch:  ${manualDispatch}`);

  let passed = true;
  if (dash.readyToProcessCount !== manualReady) { console.error(`Mismatch: readyToProcessCount (${dash.readyToProcessCount}) != ${manualReady}`); passed = false; }
  if (dash.pickingCount !== manualPicking) { console.error(`Mismatch: pickingCount (${dash.pickingCount}) != ${manualPicking}`); passed = false; }
  if (dash.packedCount !== manualPacked) { console.error(`Mismatch: packedCount (${dash.packedCount}) != ${manualPacked}`); passed = false; }
  if (dash.readyForDispatchCount !== manualDispatch) { console.error(`Mismatch: readyForDispatchCount (${dash.readyForDispatchCount}) != ${manualDispatch}`); passed = false; }

  if (passed) {
    console.log('\n🎉 ALL DASHBOARD COUNTS MATCH OUTGOING SHIPMENTS AND DATABASE PRECISELY!');
  } else {
    console.error('\n❌ FAIL: Dashboard counts did not match expected values.');
    process.exit(1);
  }
}

runTest().catch(console.error);
