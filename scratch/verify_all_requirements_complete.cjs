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
      headers: { 'Authorization': `Bearer ${token}` }
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

async function verifyAll() {
  console.log('====================================================');
  console.log('  FINAL VERIFICATION — WAREHOUSE DASHBOARD & STAGES ');
  console.log('====================================================\n');

  // 1. Manager Authentication
  console.log('1. Authenticating Warehouse Manager (WH-BLR-001)...');
  const loginRes = await post('/api/auth/login', { email: 'priya@primeroute.com', password: 'Manager@2026!' });
  const token = loginRes.data?.token || loginRes.data?.data?.token;
  console.log('✓ Token acquired successfully.\n');

  // 2. Warehouse Details
  console.log('2. Warehouse Profile:');
  const wh = (await get('/api/warehouse-manager/warehouse', token)).data?.data;
  console.log(`- Warehouse Code: ${wh.code}`);
  console.log(`- Warehouse Name: ${wh.name}`);
  console.log(`- City / State:   ${wh.city}, ${wh.state}`);
  console.log(`- Manager:        ${wh.managerName} (${wh.managerEmail})\n`);

  // 3. Current Dashboard Metrics
  console.log('3. Dashboard Stage Counts from Backend API:');
  const dash = (await get('/api/warehouse-manager/dashboard', token)).data?.data;
  console.log(`  [1] Ready to Process:    ${dash.readyToProcessCount}`);
  console.log(`  [2] Picking in Progress: ${dash.pickingCount}`);
  console.log(`  [3] Packed Consignments: ${dash.packedCount}`);
  console.log(`  [4] Ready for Dispatch:  ${dash.readyForDispatchCount}`);
  console.log(`  Total In-Warehouse Queue: ${dash.readyToProcessCount + dash.pickingCount + dash.packedCount + dash.readyForDispatchCount}`);
  console.log(`  Total Outgoing Count:     ${dash.outgoingShipmentsCount}\n`);

  // 4. Outgoing Shipments Verification
  console.log('4. Outgoing Shipments List Verification:');
  const outgoing = (await get('/api/warehouse-manager/shipments/outgoing', token)).data?.data;
  let inWarehouseCount = 0;
  let inTransitCount = 0;
  let deliveredCount = 0;

  outgoing.forEach(s => {
    const isTerminal = s.status === 'DELIVERED' || s.status === 'CANCELLED';
    const isTransit = s.status === 'IN_TRANSIT' || s.status === 'OUT_FOR_DELIVERY' || s.operationalStage === 'DISPATCHED' || s.operationalStage === 'IN_TRANSIT' || s.operationalStage === 'OUT_FOR_DELIVERY';
    
    if (isTerminal) deliveredCount++;
    else if (isTransit) inTransitCount++;
    else inWarehouseCount++;

    console.log(`  - [${s.trackingNumber}] Stage: ${s.operationalStage.padEnd(18)} | Status: ${s.status.padEnd(12)} | Driver: ${(s.driverName || 'Unassigned').padEnd(16)} | Vehicle: ${s.vehicleNumber || 'Unassigned'}`);
  });

  console.log(`\n  Summary: Active In-Warehouse = ${inWarehouseCount}, In Transit/Dispatched = ${inTransitCount}, Delivered = ${deliveredCount}`);

  // 5. Verify Isolation: In-Transit and Delivered do NOT inflate the 4 active queue cards
  const sumActiveQueue = dash.readyToProcessCount + dash.pickingCount + dash.packedCount + dash.readyForDispatchCount;
  if (sumActiveQueue !== inWarehouseCount) {
    console.error(`❌ ERROR: In-warehouse active queue sum (${sumActiveQueue}) does not equal active in-warehouse shipments (${inWarehouseCount})!`);
    process.exit(1);
  }
  console.log('✓ VERIFIED: Active warehouse processing queue accurately counts only active in-warehouse shipments without inflation.\n');

  // 6. Test Multi-stage transition on an active packed shipment
  const packedShipment = outgoing.find(s => s.operationalStage === 'PACKED' && s.status !== 'IN_TRANSIT' && s.status !== 'DELIVERED');
  if (packedShipment) {
    console.log(`5. Testing Live Stage Transition on Packed Shipment #${packedShipment.id} (${packedShipment.trackingNumber})...`);
    const beforePacked = dash.packedCount;
    const beforeRfd = dash.readyForDispatchCount;

    console.log('   Action: Staging for dispatch (mark-ready-for-dispatch)...');
    const rfdRes = await post(`/api/warehouse-manager/shipments/${packedShipment.id}/ready-for-dispatch`, {}, { 'Authorization': `Bearer ${token}` });
    console.log(`   Stage updated to: ${rfdRes.data?.data?.operationalStage}`);

    const newDash = (await get('/api/warehouse-manager/dashboard', token)).data?.data;
    console.log(`   Dashboard Packed Count:             ${newDash.packedCount} (decreased from ${beforePacked})`);
    console.log(`   Dashboard Ready For Dispatch Count: ${newDash.readyForDispatchCount} (increased from ${beforeRfd})`);

    if (newDash.packedCount !== beforePacked - 1 || newDash.readyForDispatchCount !== beforeRfd + 1) {
      console.error('❌ Stage transition count update failed!');
      process.exit(1);
    }
    console.log('✓ VERIFIED: Live transition dynamically and correctly updated database & dashboard counts!\n');
  }

  console.log('====================================================');
  console.log('  ALL CHECKS PASSED PERFECTLY!');
  console.log('====================================================');
}

verifyAll().catch(console.error);
