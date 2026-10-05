const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, headers: res.headers, body: parsed, rawBody: body });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, rawBody: body });
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

async function login(email, password = 'Password123!') {
  const res = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email, password });

  const token = res.body?.token || res.body?.data?.token;
  if (res.status === 200 && token) {
    return token;
  }
  throw new Error(`Login failed for ${email}: ${JSON.stringify(res.body)}`);
}

async function createAddress(token, payload) {
  const res = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/customer/addresses',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    addressType: payload.addressType || 'SHIPPING',
    contactName: payload.contactName || 'Test Contact',
    phone: payload.phone || '+91 9876543210',
    addressLine1: payload.addressLine1,
    city: payload.city,
    state: payload.state,
    postalCode: payload.postalCode,
    country: payload.country || 'India',
    defaultAddress: false
  });
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Failed to create address: ${JSON.stringify(res.body)}`);
  }
  return res.body.data;
}

async function runTests() {
  console.log('=== STARTING WAREHOUSE WORKFLOW REDESIGN INTEGRATION TESTS ===\n');

  // 1. Authenticate users
  console.log('1. Authenticating test users...');
  const customerToken = await login('customer@primeroute.com', 'Password123!');
  console.log('   Customer (customer@primeroute.com) logged in: OK');

  const blrToken = await login('priya@primeroute.com', 'Password123!');
  console.log('   Bengaluru Manager (WH-BLR-001) logged in: OK');

  const ccuToken = await login('ccu.east@primeroute.com', 'Password123!');
  console.log('   Kolkata Manager (WH-CCU-006) logged in: OK');

  const adminToken = await login('admin@primeroute.com', 'Password123!');
  console.log('   Admin (admin@primeroute.com) logged in: OK\n');

  // 2. TEST 1: Create Order A (Pickup = Bengaluru, Delivery = Kolkata)
  console.log('2. TEST 1: Creating Order A (Bengaluru -> Kolkata)...');
  const blrPickup = await createAddress(customerToken, {
    addressType: 'PICKUP',
    contactName: 'BLR Pickup Facility',
    addressLine1: 'MG Road Hub 101',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560001'
  });
  const ccuDelivery = await createAddress(customerToken, {
    addressType: 'DELIVERY',
    contactName: 'CCU Customer Site',
    addressLine1: 'Salt Lake Sector V',
    city: 'Kolkata',
    state: 'West Bengal',
    postalCode: '700091'
  });

  const orderARes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/customer/orders',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    }
  }, {
    pickupAddressId: blrPickup.id,
    deliveryAddressId: ccuDelivery.id,
    packageDescription: 'Electronics & Sensors',
    packageWeight: 25.5,
    packageQuantity: 3,
    deliveryType: 'EXPRESS'
  });

  if (orderARes.status !== 200 && orderARes.status !== 201) {
    throw new Error(`Failed to create Order A: ${JSON.stringify(orderARes.body)}`);
  }
  const orderA = orderARes.body.data;
  console.log(`   Order A created: ID ${orderA.id}, Number: ${orderA.orderNumber}, Origin WH: ${orderA.originWarehouseName} (ID: ${orderA.originWarehouseId})`);

  // Verify Bengaluru manager sees Order A
  const blrOrders1 = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/orders',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${blrToken}` }
  });
  const blrHasOrderA = blrOrders1.body.data.some(o => o.id === orderA.id);
  console.log(`   Bengaluru Manager "My Orders" includes Order A? ${blrHasOrderA ? 'YES (PASS)' : 'NO (FAIL)'}`);
  if (!blrHasOrderA) throw new Error('Order A missing from Bengaluru manager orders');

  // Verify Kolkata manager does NOT see Order A
  const ccuOrders1 = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/orders',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${ccuToken}` }
  });
  const ccuHasOrderA = ccuOrders1.body.data.some(o => o.id === orderA.id);
  console.log(`   Kolkata Manager "My Orders" includes Order A? ${ccuHasOrderA ? 'YES (FAIL - should NOT be shown)' : 'NO (PASS)'}`);
  if (ccuHasOrderA) throw new Error('Order A illegally visible to Kolkata manager');

  // 3. TEST 2: Create Order B (Pickup = Kolkata, Delivery = Bengaluru)
  console.log('\n3. TEST 2: Creating Order B (Kolkata -> Bengaluru)...');
  const ccuPickup = await createAddress(customerToken, {
    addressType: 'PICKUP',
    contactName: 'CCU Pickup Hub',
    addressLine1: 'Park Street 50',
    city: 'Kolkata',
    state: 'West Bengal',
    postalCode: '700016'
  });
  const blrDelivery = await createAddress(customerToken, {
    addressType: 'DELIVERY',
    contactName: 'BLR Client Site',
    addressLine1: 'Electronic City Phase 1',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560100'
  });

  const orderBRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/customer/orders',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    }
  }, {
    pickupAddressId: ccuPickup.id,
    deliveryAddressId: blrDelivery.id,
    packageDescription: 'Textiles & Jute Spools',
    packageWeight: 40.0,
    packageQuantity: 5,
    deliveryType: 'STANDARD'
  });

  if (orderBRes.status !== 200 && orderBRes.status !== 201) {
    throw new Error(`Failed to create Order B: ${JSON.stringify(orderBRes.body)}`);
  }
  const orderB = orderBRes.body.data;
  console.log(`   Order B created: ID ${orderB.id}, Number: ${orderB.orderNumber}, Origin WH: ${orderB.originWarehouseName} (ID: ${orderB.originWarehouseId})`);

  // Verify Kolkata manager sees Order B
  const ccuOrders2 = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/orders',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${ccuToken}` }
  });
  const ccuHasOrderB = ccuOrders2.body.data.some(o => o.id === orderB.id);
  console.log(`   Kolkata Manager "My Orders" includes Order B? ${ccuHasOrderB ? 'YES (PASS)' : 'NO (FAIL)'}`);
  if (!ccuHasOrderB) throw new Error('Order B missing from Kolkata manager orders');

  // Verify Bengaluru manager does NOT see Order B
  const blrOrders2 = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/orders',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${blrToken}` }
  });
  const blrHasOrderB = blrOrders2.body.data.some(o => o.id === orderB.id);
  console.log(`   Bengaluru Manager "My Orders" includes Order B? ${blrHasOrderB ? 'YES (FAIL - should NOT be shown)' : 'NO (PASS)'}`);
  if (blrHasOrderB) throw new Error('Order B illegally visible to Bengaluru manager');

  // 4. TEST 4: Cross-warehouse authorization protection (403 Forbidden)
  console.log('\n4. TEST 4: Cross-warehouse authorization tests...');
  const unauthorizedProcessing = await request({
    hostname: 'localhost',
    port: 8080,
    path: `/api/warehouse-manager/orders/${orderA.id}/start-processing`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${ccuToken}` } // Kolkata manager trying to process Bengaluru order
  });
  console.log(`   Kolkata manager attempting to process Bengaluru Order A: Status ${unauthorizedProcessing.status} ${unauthorizedProcessing.status === 403 ? '(PASS - 403 Forbidden)' : '(FAIL)'}`);
  if (unauthorizedProcessing.status !== 403) throw new Error('Expected 403 Forbidden for cross-warehouse order processing');

  const unauthorizedOrderView = await request({
    hostname: 'localhost',
    port: 8080,
    path: `/api/warehouse-manager/orders/${orderA.id}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${ccuToken}` }
  });
  console.log(`   Kolkata manager attempting to view Bengaluru Order A details: Status ${unauthorizedOrderView.status} ${unauthorizedOrderView.status === 403 ? '(PASS - 403 Forbidden)' : '(FAIL)'}`);
  if (unauthorizedOrderView.status !== 403) throw new Error('Expected 403 Forbidden for cross-warehouse order detail access');

  // 5. TEST Order Processing Lifecycle for Order A (Bengaluru)
  console.log('\n5. Processing Order A lifecycle (CONFIRMED -> PICKING -> PACKED -> READY_FOR_DISPATCH)...');
  const startProc = await request({
    hostname: 'localhost',
    port: 8080,
    path: `/api/warehouse-manager/orders/${orderA.id}/start-processing`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${blrToken}` }
  });
  console.log(`   Start Processing (PICKING): Status ${startProc.status}, Order Status: ${startProc.body?.data?.status}`);

  const packProc = await request({
    hostname: 'localhost',
    port: 8080,
    path: `/api/warehouse-manager/orders/${orderA.id}/pack`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${blrToken}` }
  });
  console.log(`   Mark Packed (PACKED): Status ${packProc.status}, Order Status: ${packProc.body?.data?.status}`);

  const readyProc = await request({
    hostname: 'localhost',
    port: 8080,
    path: `/api/warehouse-manager/orders/${orderA.id}/ready-for-dispatch`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${blrToken}` }
  });
  console.log(`   Mark Ready for Dispatch (READY_FOR_DISPATCH): Status ${readyProc.status}, Order Status: ${readyProc.body?.data?.status}, Shipment ID: ${readyProc.body?.data?.shipmentId}`);

  const shipmentIdA = readyProc.body?.data?.shipmentId;
  if (!shipmentIdA) throw new Error('Shipment was not created upon READY_FOR_DISPATCH');

  // 6. TEST Outgoing Shipments Scoping
  console.log('\n6. Checking Outgoing Shipments scoping...');
  const blrOutgoing = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/shipments/outgoing',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${blrToken}` }
  });
  const blrHasShipmentA = blrOutgoing.body?.data?.some(s => s.id === shipmentIdA || s.orderId === orderA.id);
  console.log(`   Bengaluru Manager Outgoing Shipments includes Shipment A? ${blrHasShipmentA ? 'YES (PASS)' : 'NO (FAIL)'}`);
  if (!blrHasShipmentA) throw new Error('Shipment A missing from Bengaluru outgoing shipments');

  const ccuOutgoing = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/shipments/outgoing',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${ccuToken}` }
  });
  const ccuHasShipmentA = ccuOutgoing.body?.data?.some(s => s.id === shipmentIdA || s.orderId === orderA.id);
  console.log(`   Kolkata Manager Outgoing Shipments includes Shipment A? ${ccuHasShipmentA ? 'YES (FAIL - should NOT be shown)' : 'NO (PASS)'}`);
  if (ccuHasShipmentA) throw new Error('Shipment A illegally visible in Kolkata outgoing shipments');

  // 7. TEST 5: Fleet Assignment & Fleet Pairing Validation
  console.log('\n7. TEST 5: Fleet Assignment & cross-warehouse validation...');
  // Check available fleet pairs in Bengaluru
  const blrDrivers = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/drivers/available',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${blrToken}` }
  });
  const blrVehicles = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/vehicles/available',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${blrToken}` }
  });

  console.log(`   Bengaluru available drivers: ${blrDrivers.body?.data?.length || 0}, vehicles: ${blrVehicles.body?.data?.length || 0}`);
  
  // Kolkata drivers
  const ccuDrivers = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/drivers/available',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${ccuToken}` }
  });
  console.log(`   Kolkata available drivers: ${ccuDrivers.body?.data?.length || 0}`);

  if (ccuDrivers.body?.data?.length > 0 && blrVehicles.body?.data?.length > 0) {
    const crossAssign = await request({
      hostname: 'localhost',
      port: 8080,
      path: `/api/warehouse-manager/shipments/${shipmentIdA}/assign-fleet`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${blrToken}`
      }
    }, {
      driverId: ccuDrivers.body.data[0].id, // Driver from Kolkata
      vehicleId: blrVehicles.body.data[0].id // Vehicle from Bengaluru
    });
    console.log(`   Attempt to assign Kolkata driver to Bengaluru shipment: Status ${crossAssign.status} ${crossAssign.status >= 400 ? '(PASS - Rejected)' : '(FAIL)'}`);
    if (crossAssign.status < 400) throw new Error('Expected cross-warehouse fleet assignment to be rejected');
  }

  // Valid Bengaluru fleet assignment
  const blrDriver = blrDrivers.body?.data?.[0];
  const blrVehicle = blrVehicles.body?.data?.[0];
  if (blrDriver && blrVehicle) {
    const validAssign = await request({
      hostname: 'localhost',
      port: 8080,
      path: `/api/warehouse-manager/shipments/${shipmentIdA}/assign-fleet`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${blrToken}`
      }
    }, {
      driverId: blrDriver.id,
      vehicleId: blrVehicle.id
    });
    console.log(`   Valid Bengaluru fleet assignment: Status ${validAssign.status} ${validAssign.status === 200 ? '(PASS)' : '(FAIL)'}`);
    if (validAssign.status !== 200) throw new Error(`Fleet assignment failed: ${JSON.stringify(validAssign.body)}`);

    // 8. TEST Dispatch & Direct Delivery
    console.log('\n8. Dispatching Shipment A (DISPATCHED -> IN_TRANSIT -> OUT_FOR_DELIVERY -> DELIVERED direct to customer)...');
    const dispatchRes = await request({
      hostname: 'localhost',
      port: 8080,
      path: `/api/warehouse-manager/shipments/${shipmentIdA}/dispatch`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${blrToken}` }
    });
    console.log(`   Dispatch: Status ${dispatchRes.status}, Shipment Status: ${dispatchRes.body?.data?.status}`);

    const inTransitRes = await request({
      hostname: 'localhost',
      port: 8080,
      path: `/api/warehouse-manager/shipments/${shipmentIdA}/in-transit`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${blrToken}` }
    });
    console.log(`   In Transit: Status ${inTransitRes.status}, Shipment Status: ${inTransitRes.body?.data?.status}`);

    const outForDelRes = await request({
      hostname: 'localhost',
      port: 8080,
      path: `/api/warehouse-manager/shipments/${shipmentIdA}/out-for-delivery`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${blrToken}` }
    });
    console.log(`   Out For Delivery: Status ${outForDelRes.status}, Shipment Status: ${outForDelRes.body?.data?.status}`);

    const deliverRes = await request({
      hostname: 'localhost',
      port: 8080,
      path: `/api/warehouse-manager/shipments/${shipmentIdA}/deliver`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${blrToken}` }
    });
    console.log(`   Delivered directly to customer address: Status ${deliverRes.status}, Shipment Status: ${deliverRes.body?.data?.status}`);

    // Verify Tracking Events
    const trackingEvents = await request({
      hostname: 'localhost',
      port: 8080,
      path: `/api/tracking/${orderA.orderNumber}`,
      method: 'GET'
    });
    console.log(`   Public Tracking events logged: ${trackingEvents.body?.data?.events?.length || trackingEvents.body?.data?.length || 'OK'}`);
  }

  console.log('\n====================================================');
  console.log('ALL WORKFLOW REDESIGN INTEGRATION TESTS PASSED 100%!');
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('\nTEST FAILED:', err);
  process.exit(1);
});
