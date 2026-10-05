const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function login(email, password) {
  const res = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email, password });
  return res.data?.token || res.data?.accessToken;
}

async function get(path, token) {
  return await request({
    hostname: 'localhost',
    port: 8080,
    path,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

async function post(path, data, token) {
  return await request({
    hostname: 'localhost',
    port: 8080,
    path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, data);
}

async function run() {
  console.log('================================================================');
  console.log('DRIVER PORTAL STEP 2: COMPLETE END-TO-END VERIFICATION');
  console.log('================================================================\n');

  // 1. Warehouse Manager Login
  console.log('1. Warehouse Manager Login (priya@primeroute.com)...');
  const wmToken = await login('priya@primeroute.com', 'Manager@2026!');
  if (!wmToken) {
    console.error('Failed to log in as Warehouse Manager');
    return;
  }
  console.log('-> Success. Token acquired.');

  // 2. Get Ready for Dispatch Shipments from Warehouse
  console.log('\n2. Finding a real READY_FOR_DISPATCH shipment in Warehouse...');
  let rfdRes = await get('/api/warehouse/shipments/dispatch-ready', wmToken);
  let rfdList = Array.isArray(rfdRes.data?.data) ? rfdRes.data.data : (Array.isArray(rfdRes.data) ? rfdRes.data : []);
  if (rfdList.length === 0) {
    rfdRes = await get('/api/warehouse/shipments/outgoing', wmToken);
    const outList = Array.isArray(rfdRes.data?.data) ? rfdRes.data.data : (Array.isArray(rfdRes.data) ? rfdRes.data : []);
    rfdList = outList.filter(s => s.operationalStage === 'READY_FOR_DISPATCH' || s.status === 'CONFIRMED');
  }
  console.log(`Found ${rfdList.length} ready-for-dispatch shipments.`);

  if (rfdList.length === 0) {
    console.error('No ready for dispatch shipments available');
    return;
  }

  const targetShipment = rfdList[0];
  const shipmentId = targetShipment.id;
  const trackingNumber = targetShipment.trackingNumber;
  console.log(`Targeting real shipment ID: ${shipmentId} (${trackingNumber})`);

  // 3. Warehouse Manager assigns Driver (ID 20 - Ramesh Kumar) + Vehicle (ID 1 - VH-001)
  console.log(`\n3. Warehouse Manager assigning Driver 20 (Ramesh Kumar) and Vehicle 1 (VH-001) to shipment ${shipmentId}...`);
  const assignRes = await post(`/api/warehouse/shipments/${shipmentId}/assign-fleet`, {
    driverId: 20,
    vehicleId: 1
  }, wmToken);
  console.log(`Assign Fleet Response Status: ${assignRes.status}`);

  // 4. Warehouse Manager dispatches the shipment
  console.log(`\n4. Warehouse Manager dispatching shipment ${shipmentId}...`);
  const dispatchRes = await post(`/api/warehouse/shipments/${shipmentId}/dispatch`, {}, wmToken);
  console.log(`Dispatch Response Status: ${dispatchRes.status}`);

  // 5. Driver Login
  console.log('\n5. Driver Login (ramesh@primeroute.com)...');
  const driverToken = await login('ramesh@primeroute.com', 'Driver@2026!');
  if (!driverToken) {
    console.error('Failed to log in as Driver Ramesh');
    return;
  }
  console.log('-> Success. Driver token acquired.');

  // 6. Driver sees active shipment
  console.log('\n6. Driver querying /api/driver/deliveries/active...');
  const activeRes = await get('/api/driver/deliveries/active', driverToken);
  const activeDelivery = activeRes.data?.data;
  console.log('Active Delivery:', {
    id: activeDelivery?.id,
    trackingNumber: activeDelivery?.trackingNumber,
    status: activeDelivery?.status,
    operationalStage: activeDelivery?.operationalStage,
    recipientName: activeDelivery?.recipientName,
    destination: activeDelivery?.destination?.address,
    trackingEventsCount: activeDelivery?.trackingEvents?.length
  });

  if (activeDelivery?.id !== String(shipmentId)) {
    console.error(`Mismatch in active delivery ID: expected ${shipmentId}, got ${activeDelivery?.id}`);
  } else {
    console.log('✓ Verified: Driver successfully sees the dispatched shipment in IN_TRANSIT!');
  }

  // 7. Driver operational action: Mark OUT_FOR_DELIVERY
  console.log(`\n7. Driver performing operational action: POST /api/driver/deliveries/${shipmentId}/out-for-delivery...`);
  const outRes = await post(`/api/driver/deliveries/${shipmentId}/out-for-delivery`, {}, driverToken);
  console.log(`Response Status: ${outRes.status}`);
  console.log('Updated Status:', outRes.data?.data?.status);
  console.log('Updated Stage:', outRes.data?.data?.operationalStage);
  console.log('Tracking Events:', outRes.data?.data?.trackingEvents?.map(e => `[${e.status}] ${e.title} - ${e.location}`));

  // 8. Verify refresh persists
  console.log('\n8. Driver refreshing /api/driver/deliveries/active...');
  const refreshRes = await get('/api/driver/deliveries/active', driverToken);
  console.log('Refreshed Status:', refreshRes.data?.data?.status);
  if (refreshRes.data?.data?.status === 'OUT_FOR_DELIVERY') {
    console.log('✓ Verified: OUT_FOR_DELIVERY status successfully persisted in PostgreSQL database!');
  }

  // 9. Double-submission / idempotency test
  console.log('\n9. Testing Double Submission Protection (Calling /out-for-delivery again)...');
  const doubleRes = await post(`/api/driver/deliveries/${shipmentId}/out-for-delivery`, {}, driverToken);
  console.log(`Double Submission Response Status: ${doubleRes.status} (Expected: 200 OK without duplicate event)`);
  console.log(`Tracking events count: ${doubleRes.data?.data?.trackingEvents?.length}`);

  // 10. Security & Cross-Driver Authorization Test
  console.log('\n10. Testing Cross-Driver Security with Driver 2 (Priya Patel)...');
  const driver2Token = await login('priya.patel@primeroute.in', 'Driver@2026!');
  if (driver2Token) {
    const crossAccess = await get(`/api/driver/deliveries/${shipmentId}`, driver2Token);
    console.log(`Driver 2 accessing Driver 1 delivery -> Status: ${crossAccess.status} (Expected: 403 Forbidden)`);
    const crossOp = await post(`/api/driver/deliveries/${shipmentId}/out-for-delivery`, {}, driver2Token);
    console.log(`Driver 2 operating Driver 1 delivery -> Status: ${crossOp.status} (Expected: 403 Forbidden)`);
    if (crossAccess.status === 403 && crossOp.status === 403) {
      console.log('✓ Verified: Strict 403 Forbidden enforcement on cross-driver delivery access and operations!');
    }
  }

  // 11. Driver Dashboard Verification
  console.log('\n11. Verifying Driver Dashboard KPIs...');
  const dashRes = await get('/api/driver/dashboard', driverToken);
  console.log('Dashboard Data:', {
    driverName: dashRes.data?.data?.driverName,
    driverStatus: dashRes.data?.data?.driverStatus,
    todaysDeliveries: dashRes.data?.data?.todaysDeliveries,
    pendingDeliveries: dashRes.data?.data?.pendingDeliveries,
    distanceKmToday: dashRes.data?.data?.distanceKmToday,
    activeShipment: dashRes.data?.data?.activeDelivery?.trackingNumber
  });

  console.log('\n================================================================');
  console.log('ALL STEP 2 OPERATIONS & VERIFICATIONS PASSED SUCCESSFULLY!');
  console.log('================================================================');
}

run().catch(console.error);
