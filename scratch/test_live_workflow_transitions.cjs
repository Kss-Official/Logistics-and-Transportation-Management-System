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

async function run() {
  console.log('=== PART 8 — LIVE WORKFLOW TRANSITIONS TEST ===\n');

  // 1. Authenticate
  const loginRes = await post('/api/auth/login', { email: 'priya@primeroute.com', password: 'Manager@2026!' });
  const token = loginRes.data?.token || loginRes.data?.data?.token;

  // 2. Initial Dashboard State
  let dash = (await get('/api/warehouse-manager/dashboard', token)).data?.data;
  console.log('--- Initial State ---');
  console.log(`READY_TO_PROCESS:    ${dash.readyToProcessCount}`);
  console.log(`PICKING:             ${dash.pickingCount}`);
  console.log(`PACKED:              ${dash.packedCount}`);
  console.log(`READY_FOR_DISPATCH:  ${dash.readyForDispatchCount}`);

  // Test Shipment ID 1 (TRK-PR-ORD-67363257, currently in PICKING)
  console.log('\n--- Step A: Mark Shipment #1 as PACKED ---');
  const packRes = await post('/api/warehouse-manager/shipments/1/mark-packed', {}, { 'Authorization': `Bearer ${token}` });
  console.log('Mark Packed response stage:', packRes.data?.data?.operationalStage || packRes.data?.operationalStage);

  dash = (await get('/api/warehouse-manager/dashboard', token)).data?.data;
  console.log('Dashboard Counts after Mark Packed:');
  console.log(`PICKING:             ${dash.pickingCount} (Expected: 0)`);
  console.log(`PACKED:              ${dash.packedCount} (Expected: 3)`);
  console.log(`READY_FOR_DISPATCH:  ${dash.readyForDispatchCount} (Expected: 0)`);

  if (dash.pickingCount !== 0 || dash.packedCount !== 3) {
    console.error('FAILED Step A check!');
    process.exit(1);
  }

  console.log('\n--- Step B: Mark Shipment #1 as READY_FOR_DISPATCH ---');
  const rfdRes = await post('/api/warehouse-manager/shipments/1/ready-for-dispatch', {}, { 'Authorization': `Bearer ${token}` });
  console.log('Ready for Dispatch response stage:', rfdRes.data?.data?.operationalStage || rfdRes.data?.operationalStage);

  dash = (await get('/api/warehouse-manager/dashboard', token)).data?.data;
  console.log('Dashboard Counts after Ready For Dispatch:');
  console.log(`PACKED:              ${dash.packedCount} (Expected: 2)`);
  console.log(`READY_FOR_DISPATCH:  ${dash.readyForDispatchCount} (Expected: 1)`);

  if (dash.packedCount !== 2 || dash.readyForDispatchCount !== 1) {
    console.error('FAILED Step B check!');
    process.exit(1);
  }

  console.log('\n--- Step C: Assign Fleet to Shipment #1 ---');
  // Get available driver & vehicle
  const drivers = (await get('/api/warehouse-manager/drivers/available', token)).data?.data;
  const vehicles = (await get('/api/warehouse-manager/vehicles/available', token)).data?.data;
  console.log(`Available Driver: ${drivers[0].fullName} (ID: ${drivers[0].id}), Vehicle: ${vehicles[0].vehicleNumber} (ID: ${vehicles[0].id})`);

  const assignRes = await post('/api/warehouse-manager/shipments/1/assign-fleet', {
    driverId: drivers[0].id,
    vehicleId: vehicles[0].id
  }, { 'Authorization': `Bearer ${token}` });
  console.log('Assign Fleet response assignment status:', assignRes.data?.data?.assignmentStatus || assignRes.data?.assignmentStatus);

  console.log('\n--- Step D: Dispatch Shipment #1 ---');
  const dispatchRes = await post('/api/warehouse-manager/shipments/1/dispatch', {}, { 'Authorization': `Bearer ${token}` });
  console.log('Dispatch response status:', dispatchRes.data?.data?.status || dispatchRes.data?.status);
  console.log('Dispatch response stage:', dispatchRes.data?.data?.operationalStage || dispatchRes.data?.operationalStage);

  dash = (await get('/api/warehouse-manager/dashboard', token)).data?.data;
  console.log('\nDashboard Counts after Dispatch:');
  console.log(`READY_TO_PROCESS:    ${dash.readyToProcessCount} (Expected: 0)`);
  console.log(`PICKING:             ${dash.pickingCount} (Expected: 0)`);
  console.log(`PACKED:              ${dash.packedCount} (Expected: 2)`);
  console.log(`READY_FOR_DISPATCH:  ${dash.readyForDispatchCount} (Expected: 0)`);

  if (dash.readyForDispatchCount !== 0) {
    console.error('FAILED Step D check!');
    process.exit(1);
  }

  console.log('\n🎉 FULL LIVE WORKFLOW TRANSITION SUCCEEDED AND DASHBOARD COUNTERS UPDATED PERFECTLY!');
}

run().catch(console.error);
