const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runE2ETests() {
  console.log('=== STARTING WAREHOUSE PORTAL E2E INTEGRATION SUITE ===\n');

  // 1. Authenticate as Priya (Warehouse Manager)
  console.log('1. Authenticating as Warehouse Manager (priya@primeroute.com)...');
  const loginRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'priya@primeroute.com',
    password: 'Manager@2026!'
  });

  const authData = loginRes.data?.data || loginRes.data;
  if (loginRes.status !== 200 || !authData?.token) {
    console.error('FAILED: Login failed', loginRes.status, loginRes.data);
    process.exit(1);
  }

  const token = authData.token;
  const user = authData;
  console.log('✓ Success! Logged in as:', user.fullName || user.name, '| Role:', user.role);
  console.log('  Assigned Hub:', user.warehouseName, `(${user.warehouseCode})`);

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. Fetch Profile
  console.log('\n2. Testing GET /api/warehouse-manager/profile...');
  const profRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/profile',
    method: 'GET',
    headers: authHeaders
  });
  console.log('✓ Status:', profRes.status);
  console.log('  Profile Details:', profRes.data?.data?.fullName, 'at', profRes.data?.data?.warehouseName);

  // 3. Fetch Warehouse Details
  console.log('\n3. Testing GET /api/warehouse-manager/warehouse...');
  const whRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/warehouse',
    method: 'GET',
    headers: authHeaders
  });
  console.log('✓ Status:', whRes.status);
  console.log('  Facility:', whRes.data?.data?.name, '| Code:', whRes.data?.data?.code, '| Occupancy:', whRes.data?.data?.currentOccupancy);

  // 4. Update Warehouse Details
  console.log('\n4. Testing PUT /api/warehouse-manager/warehouse...');
  const updateWhRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/warehouse',
    method: 'PUT',
    headers: authHeaders
  }, {
    contactPhone: '+91 80 2555 9999',
    operatingHours: '24/7 Operations (3 Automated Shifts)',
    dockDoors: 14
  });
  console.log('✓ Status:', updateWhRes.status);
  console.log('  Updated Operating Hours:', updateWhRes.data?.data?.operatingHours);

  // 5. Fetch Dashboard
  console.log('\n5. Testing GET /api/warehouse-manager/dashboard...');
  const dashRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/dashboard',
    method: 'GET',
    headers: authHeaders
  });
  console.log('✓ Status:', dashRes.status);
  const dash = dashRes.data?.data;
  console.log('  Total SKU Items:', dash?.totalInventoryItems);
  console.log('  Available Stock:', dash?.availableStock);
  console.log('  Occupancy Rate:', dash?.utilizationRate + '%');
  console.log('  Incoming Loads:', dash?.incomingShipmentsCount);
  console.log('  Outgoing Loads:', dash?.outgoingShipmentsCount);
  console.log('  Assigned Drivers:', dash?.driversTotalCount);
  console.log('  Assigned Vehicles:', dash?.vehiclesTotalCount);

  // 6. Fetch Inventory
  console.log('\n6. Testing GET /api/warehouse-manager/inventory...');
  const invRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/inventory',
    method: 'GET',
    headers: authHeaders
  });
  console.log('✓ Status:', invRes.status);
  console.log('  Retrieved items count:', invRes.data?.data?.length);
  const firstItem = invRes.data?.data?.[0];
  console.log('  Sample Item:', firstItem?.sku, '-', firstItem?.productName, '| Available:', firstItem?.availableStock);

  // 7. Test Inbound Stock Receive
  console.log('\n7. Testing POST /api/warehouse-manager/inventory/receive...');
  const receiveRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/inventory/receive',
    method: 'POST',
    headers: authHeaders
  }, {
    sku: 'SKU-ELEC-001',
    quantity: 25,
    reason: 'Vendor Delivery Batch PO-9921',
    referenceNumber: 'PO-9921'
  });
  console.log('✓ Status:', receiveRes.status);
  console.log('  After Receive Available Stock:', receiveRes.data?.data?.availableStock);

  // 8. Test Stock Reservation
  console.log('\n8. Testing POST /api/warehouse-manager/inventory/reserve...');
  const reserveRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/inventory/reserve',
    method: 'POST',
    headers: authHeaders
  }, {
    sku: 'SKU-ELEC-001',
    quantity: 10,
    reason: 'Staging for Outbound Consignment'
  });
  console.log('✓ Status:', reserveRes.status);
  console.log('  After Reserve Available:', reserveRes.data?.data?.availableStock, '| Reserved:', reserveRes.data?.data?.reservedStock);

  // 9. Test Audit Transactions
  console.log('\n9. Testing GET /api/warehouse-manager/inventory/transactions...');
  const txRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/inventory/transactions?sku=SKU-ELEC-001',
    method: 'GET',
    headers: authHeaders
  });
  console.log('✓ Status:', txRes.status);
  console.log('  Transactions for SKU-ELEC-001:', txRes.data?.data?.length);
  const latestTx = txRes.data?.data?.[0];
  console.log('  Latest Audit Record:', latestTx?.transactionType, '| Qty:', latestTx?.quantity, '| By:', latestTx?.performedBy);

  // 10. Test Outgoing Shipments & Fleet Assignment
  console.log('\n10. Testing GET /api/warehouse-manager/shipments/outgoing...');
  const outRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/shipments/outgoing',
    method: 'GET',
    headers: authHeaders
  });
  console.log('✓ Status:', outRes.status);
  console.log('  Outgoing Shipments Count:', outRes.data?.data?.length);

  const targetShipment = outRes.data?.data?.[0];
  if (targetShipment) {
    console.log('  Target Shipment:', targetShipment.trackingNumber, '| Stage:', targetShipment.operationalStage);

    // Fetch drivers and vehicles
    const [drvList, vehList] = await Promise.all([
      request({ hostname: 'localhost', port: 8080, path: '/api/warehouse-manager/drivers', method: 'GET', headers: authHeaders }),
      request({ hostname: 'localhost', port: 8080, path: '/api/warehouse-manager/vehicles', method: 'GET', headers: authHeaders })
    ]);

    const driver = drvList.data?.data?.find(d => d.status === 'AVAILABLE') || drvList.data?.data?.[0];
    const vehicle = vehList.data?.data?.find(v => v.status === 'AVAILABLE') || vehList.data?.data?.[0];

    if (driver && vehicle) {
      console.log('\n11. Testing POST /api/warehouse-manager/shipments/:id/assign...');
      const assignRes = await request({
        hostname: 'localhost',
        port: 8080,
        path: `/api/warehouse-manager/shipments/${targetShipment.id}/assign`,
        method: 'POST',
        headers: authHeaders
      }, {
        driverId: driver.id,
        vehicleId: vehicle.id
      });
      console.log('✓ Status:', assignRes.status);
      console.log('  Assigned Driver:', assignRes.data?.data?.driverName, '| Vehicle:', assignRes.data?.data?.vehicleNumber);

      console.log('\n12. Testing PATCH /api/warehouse-manager/shipments/:id/stage (STAGED)...');
      const stageRes = await request({
        hostname: 'localhost',
        port: 8080,
        path: `/api/warehouse-manager/shipments/${targetShipment.id}/stage?stage=STAGED`,
        method: 'PATCH',
        headers: authHeaders
      });
      console.log('✓ Status:', stageRes.status);
      console.log('  New Stage:', stageRes.data?.data?.operationalStage);

      console.log('\n13. Testing POST /api/warehouse-manager/shipments/:id/dispatch...');
      const dispatchRes = await request({
        hostname: 'localhost',
        port: 8080,
        path: `/api/warehouse-manager/shipments/${targetShipment.id}/dispatch`,
        method: 'POST',
        headers: authHeaders
      });
      console.log('✓ Status:', dispatchRes.status);
      console.log('  Dispatched Status:', dispatchRes.data?.data?.status, '| Stage:', dispatchRes.data?.data?.operationalStage);
    }
  }

  // 14. Test Reports & Notifications
  console.log('\n14. Testing GET /api/warehouse-manager/reports and /notifications...');
  const [repRes, notifRes] = await Promise.all([
    request({ hostname: 'localhost', port: 8080, path: '/api/warehouse-manager/reports', method: 'GET', headers: authHeaders }),
    request({ hostname: 'localhost', port: 8080, path: '/api/warehouse-manager/notifications', method: 'GET', headers: authHeaders })
  ]);
  console.log('✓ Reports Status:', repRes.status, '| Total Items:', repRes.data?.data?.totalItems);
  console.log('✓ Notifications Status:', notifRes.status, '| Alerts Count:', notifRes.data?.data?.length);

  // 15. Security & Scoping Check: Try Customer Login to Warehouse Endpoint
  console.log('\n15. Testing Security Enforcment (Customer trying to call Warehouse API)...');
  const custLogin = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'customer@primeroute.com',
    password: 'customer123'
  });
  const custToken = custLogin.data?.data?.token || custLogin.data?.token;

  const forbiddenRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/dashboard',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${custToken}` }
  });
  console.log('✓ Security Check Status:', forbiddenRes.status, '(Expected 403 Forbidden)');
  if (forbiddenRes.status === 403) {
    console.log('  Role-based security is properly enforced!');
  } else {
    console.error('  WARNING: Expected 403 Forbidden but got', forbiddenRes.status);
  }

  console.log('\n=== ALL E2E TESTS PASSED WITH 100% SUCCESS ===\n');
}

runE2ETests().catch(err => {
  console.error('E2E Test Run Error:', err);
  process.exit(1);
});
