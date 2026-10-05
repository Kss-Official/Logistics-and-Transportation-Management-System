const assert = require('assert');

const BASE_URL = 'http://localhost:8080/api';

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const res = await fetch(url, options);
  let json = null;
  try {
    json = await res.json();
  } catch (e) {
    // not JSON
  }
  return { status: res.status, ok: res.ok, data: json };
}

async function login(email, password) {
  const res = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(`Login failed for ${email} (${res.status}): ${JSON.stringify(res.data)}`);
  }
  return res.data.token || res.data.data?.token;
}

async function createAddress(token, addr) {
  const res = await request('/customer/addresses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      addressType: addr.addressType || 'COMMERCIAL',
      contactName: addr.contactName || 'Logistics Contact',
      phone: addr.phone || '9876543210',
      addressLine1: addr.addressLine1 || 'Main Freight Corridor',
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country || 'India',
      defaultAddress: false,
    }),
  });
  if (!res.ok) {
    throw new Error(`Address creation failed (${res.status}): ${JSON.stringify(res.data)}`);
  }
  return res.data.data?.id || res.data.id;
}

async function main() {
  console.log('================================================================');
  console.log('PRIMEROUTE LOGISTICS — D9 PROJECT FREEZE COMPREHENSIVE E2E AUDIT');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // 1. AUTHENTICATION OF ALL 4 ROLES
  // -------------------------------------------------------------
  console.log('--- 1. Testing Multi-Role Authentication ---');
  
  // Register fresh customer
  const custEmail = `audit.cust.${Date.now()}@primeroute.com`;
  const regRes = await request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Audit Customer',
      email: custEmail,
      password: 'Customer@2026!',
      phone: '9876543210',
    }),
  });
  assert(regRes.status === 200 || regRes.status === 201, 'Customer register should succeed');
  const custToken = await login(custEmail, 'Customer@2026!');
  console.log('   ✓ Customer logged in successfully:', custEmail);

  // Warehouse Manager Kolkata (WH-CCU-006, ID: 6)
  const wmKolkataToken = await login('ccu.east@primeroute.com', 'Manager@2026!');
  console.log('   ✓ Kolkata Warehouse Manager logged in (ccu.east@primeroute.com)');

  // Warehouse Manager Bangalore (WH-BLR-001, ID: 1)
  const wmBlrToken = await login('priya@primeroute.com', 'Manager@2026!');
  console.log('   ✓ Bangalore Warehouse Manager logged in (priya@primeroute.com)');

  // Driver Ramesh Kumar (DRV-020, WH-BLR-001)
  const driverRameshToken = await login('ramesh@primeroute.com', 'Driver@2026!');
  console.log('   ✓ Driver Ramesh Kumar logged in (ramesh@primeroute.com)');

  // Driver Priya Patel (DRV-013, WH-CCU-006)
  const driverPriyaToken = await login('priya.patel@primeroute.in', 'Driver@2026!');
  console.log('   ✓ Driver Priya Patel logged in (priya.patel@primeroute.in)');

  // Admin
  const adminToken = await login('sanjanaaa.shru@gmail.com', 'Sanjana@102026');
  console.log('   ✓ Admin logged in (sanjanaaa.shru@gmail.com)');

  // -------------------------------------------------------------
  // 2. CRITICAL BUSINESS TEST 1: KOLKATA -> BANGALORE
  // -------------------------------------------------------------
  console.log('\n--- 2. Critical Business Test 1: Kolkata -> Bangalore ---');
  console.log('   Creating addresses: Pickup in Kolkata, Delivery in Bangalore...');
  
  const kolkataPickupAddrId = await createAddress(custToken, {
    addressType: 'COMMERCIAL',
    contactName: 'Kolkata Export Shipper',
    phone: '9830011223',
    addressLine1: 'Park Street Logistics Zone',
    city: 'Kolkata',
    state: 'West Bengal',
    postalCode: '700016',
    country: 'India',
  });

  const blrDeliveryAddrId = await createAddress(custToken, {
    addressType: 'COMMERCIAL',
    contactName: 'Bangalore Tech Consignee',
    phone: '9845099887',
    addressLine1: 'Outer Ring Road Ecospace',
    city: 'Bangalore',
    state: 'Karnataka',
    postalCode: '560103',
    country: 'India',
  });

  console.log(`   Created Address IDs: Kolkata Pickup=${kolkataPickupAddrId}, Bangalore Delivery=${blrDeliveryAddrId}`);

  const orderKolkataRes = await request('/customer/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${custToken}`,
    },
    body: JSON.stringify({
      pickupAddressId: kolkataPickupAddrId,
      deliveryAddressId: blrDeliveryAddrId,
      packageQuantity: 5,
      packageWeight: 50.0,
      packageDescription: 'Precision Electronic Sensors (Kolkata Origin)',
      deliveryType: 'EXPRESS',
    }),
  });

  assert.strictEqual(orderKolkataRes.status, 201, 'Order creation should return 201');
  const orderKolkata = orderKolkataRes.data.data;
  console.log('   ✓ Order Created:', orderKolkata.orderNumber, 'ID:', orderKolkata.id);
  console.log('   ✓ Origin Warehouse Code:', orderKolkata.originWarehouseCode);
  console.log('   ✓ Origin Warehouse Name:', orderKolkata.originWarehouseName);
  
  assert.strictEqual(orderKolkata.originWarehouseCode, 'WH-CCU-006', 'Kolkata pickup MUST resolve to WH-CCU-006 origin warehouse');
  console.log('   ✓ [PASS] Kolkata pickup resolved to Kolkata warehouse (WH-CCU-006), NOT Bengaluru!');

  // -------------------------------------------------------------
  // 3. CRITICAL BUSINESS TEST 2: BANGALORE -> KOLKATA
  // -------------------------------------------------------------
  console.log('\n--- 3. Critical Business Test 2: Bangalore -> Kolkata ---');
  console.log('   Creating addresses: Pickup in Bangalore, Delivery in Kolkata...');
  
  const blrPickupAddrId = await createAddress(custToken, {
    addressType: 'COMMERCIAL',
    contactName: 'Bangalore Electronics Shipper',
    phone: '9845122334',
    addressLine1: 'Electronic City Phase 1',
    city: 'Bangalore',
    state: 'Karnataka',
    postalCode: '560100',
    country: 'India',
  });

  const kolkataDeliveryAddrId = await createAddress(custToken, {
    addressType: 'COMMERCIAL',
    contactName: 'Kolkata Port Consignee',
    phone: '9831144556',
    addressLine1: 'Strand Road Terminal',
    city: 'Kolkata',
    state: 'West Bengal',
    postalCode: '700001',
    country: 'India',
  });

  console.log(`   Created Address IDs: Bangalore Pickup=${blrPickupAddrId}, Kolkata Delivery=${kolkataDeliveryAddrId}`);

  const orderBlrRes = await request('/customer/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${custToken}`,
    },
    body: JSON.stringify({
      pickupAddressId: blrPickupAddrId,
      deliveryAddressId: kolkataDeliveryAddrId,
      packageQuantity: 10,
      packageWeight: 100.0,
      packageDescription: 'Telecommunication Hardware (Bangalore Origin)',
      deliveryType: 'STANDARD',
    }),
  });

  assert.strictEqual(orderBlrRes.status, 201, 'Order creation should return 201');
  const orderBlr = orderBlrRes.data.data;
  console.log('   ✓ Order Created:', orderBlr.orderNumber, 'ID:', orderBlr.id);
  console.log('   ✓ Origin Warehouse Code:', orderBlr.originWarehouseCode);
  console.log('   ✓ Origin Warehouse Name:', orderBlr.originWarehouseName);
  
  assert.strictEqual(orderBlr.originWarehouseCode, 'WH-BLR-001', 'Bangalore pickup MUST resolve to WH-BLR-001 origin warehouse');
  console.log('   ✓ [PASS] Bangalore pickup resolved to Bangalore warehouse (WH-BLR-001), NOT Kolkata!');

  // -------------------------------------------------------------
  // 4. WAREHOUSE VISIBILITY & SCOPING
  // -------------------------------------------------------------
  console.log('\n--- 4. Warehouse Visibility & Scoping ---');
  
  // Kolkata manager checks orders
  const kolkataOrdersRes = await request('/warehouse-manager/orders', {
    headers: { Authorization: `Bearer ${wmKolkataToken}` },
  });
  assert.strictEqual(kolkataOrdersRes.status, 200);
  const kolkataOrders = kolkataOrdersRes.data.data || [];
  const hasKolkataOrderInKolkata = kolkataOrders.some(o => o.orderNumber === orderKolkata.orderNumber);
  const hasBlrOrderInKolkata = kolkataOrders.some(o => o.orderNumber === orderBlr.orderNumber);
  
  console.log('   ✓ Kolkata Manager sees Kolkata-origin order:', hasKolkataOrderInKolkata);
  console.log('   ✓ Kolkata Manager DOES NOT see Bangalore-origin order:', !hasBlrOrderInKolkata);
  assert(hasKolkataOrderInKolkata, 'Kolkata manager must see Kolkata order');
  assert(!hasBlrOrderInKolkata, 'Kolkata manager must NOT see Bangalore order');

  // Bangalore manager checks orders
  const blrOrdersRes = await request('/warehouse-manager/orders', {
    headers: { Authorization: `Bearer ${wmBlrToken}` },
  });
  assert.strictEqual(blrOrdersRes.status, 200);
  const blrOrders = blrOrdersRes.data.data || [];
  const hasBlrOrderInBlr = blrOrders.some(o => o.orderNumber === orderBlr.orderNumber);
  const hasKolkataOrderInBlr = blrOrders.some(o => o.orderNumber === orderKolkata.orderNumber);
  
  console.log('   ✓ Bangalore Manager sees Bangalore-origin order:', hasBlrOrderInBlr);
  console.log('   ✓ Bangalore Manager DOES NOT see Kolkata-origin order:', !hasKolkataOrderInBlr);
  assert(hasBlrOrderInBlr, 'Bangalore manager must see Bangalore order');
  assert(!hasKolkataOrderInBlr, 'Bangalore manager must NOT see Kolkata order');

  // -------------------------------------------------------------
  // 5. FULL WAREHOUSE & DRIVER FULFILLMENT LIFECYCLE
  // -------------------------------------------------------------
  console.log('\n--- 5. Full Warehouse & Driver Operational Lifecycle ---');
  console.log(`   Executing operational lifecycle for Bangalore Order #${orderBlr.id} (${orderBlr.orderNumber})...`);

  // Step A: Start Processing
  console.log('   A. Transition to PROCESSING / PICKING...');
  const pickRes = await request(`/warehouse-manager/orders/${orderBlr.id}/start-processing`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${wmBlrToken}`,
    },
  });
  assert.strictEqual(pickRes.status, 200);
  console.log('      ✓ Status:', pickRes.data.data.status, 'Stage:', pickRes.data.data.operationalStage);

  // Step B: Mark Packed
  console.log('   B. Transition to PACKED / READY_FOR_DISPATCH...');
  const packRes = await request(`/warehouse-manager/orders/${orderBlr.id}/mark-packed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${wmBlrToken}`,
    },
  });
  assert.strictEqual(packRes.status, 200);
  console.log('      ✓ Status:', packRes.data.data.status, 'Stage:', packRes.data.data.operationalStage);

  // Check shipment created
  const blrShipmentsRes = await request('/warehouse-manager/shipments/outgoing', {
    headers: { Authorization: `Bearer ${wmBlrToken}` },
  });
  const blrShipment = (blrShipmentsRes.data.data || []).find(s => s.orderNumber === orderBlr.orderNumber || s.orderId === orderBlr.id);
  assert(blrShipment, 'Shipment must exist for packed order');
  console.log('   ✓ Generated Shipment:', blrShipment.trackingNumber, 'ID:', blrShipment.id);
  console.log('   ✓ Shipment Origin Warehouse ID:', blrShipment.originWarehouseId);
  assert.strictEqual(blrShipment.originWarehouseId, 1, 'Shipment origin warehouse ID must match Bangalore warehouse (1)');

  // Step C: Assign Fleet dynamically
  console.log('   C. Fetching available fleet in Bangalore warehouse...');
  const availDriversRes = await request('/warehouse-manager/drivers/available', {
    headers: { Authorization: `Bearer ${wmBlrToken}` },
  });
  const availVehiclesRes = await request('/warehouse-manager/vehicles/available', {
    headers: { Authorization: `Bearer ${wmBlrToken}` },
  });
  const availDrivers = availDriversRes.data.data || [];
  const availVehicles = availVehiclesRes.data.data || [];
  console.log(`      Available Drivers: ${availDrivers.length}, Available Vehicles: ${availVehicles.length}`);
  
  const targetDriver = availDrivers.find(d => d.id === 20) || availDrivers[0];
  const targetVehicle = availVehicles.find(v => v.id === 1) || availVehicles[0];
  
  console.log(`      Assigning Driver #${targetDriver?.id} (${targetDriver?.fullName}) & Vehicle #${targetVehicle?.id} (${targetVehicle?.vehicleNumber})...`);
  const assignRes = await request(`/warehouse-manager/shipments/${blrShipment.id}/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${wmBlrToken}`,
    },
    body: JSON.stringify({
      driverId: targetDriver.id,
      vehicleId: targetVehicle.id,
    }),
  });
  if (!assignRes.ok) {
    console.error('      ❌ Assign Error Body:', assignRes.data);
  }
  assert.strictEqual(assignRes.status, 200);
  console.log('      ✓ Assigned Driver:', assignRes.data.data.assignedDriverName || assignRes.data.data.driverName);
  console.log('      ✓ Assigned Vehicle:', assignRes.data.data.assignedVehiclePlate || assignRes.data.data.vehicleNumber);

  // Step D: Dispatch Shipment from Dock
  console.log('   D. Dispatching Shipment from Dock...');
  const dispatchRes = await request(`/warehouse-manager/shipments/${blrShipment.id}/dispatch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${wmBlrToken}`,
    },
  });
  assert.strictEqual(dispatchRes.status, 200);
  console.log('      ✓ Status:', dispatchRes.data.data.status, 'Stage:', dispatchRes.data.data.operationalStage);

  // -------------------------------------------------------------
  // 6. DRIVER EXECUTION & GPS TELEMETRY
  // -------------------------------------------------------------
  console.log(`\n--- 6. Driver Portal Execution (${targetDriver.fullName} - ${targetDriver.email}) ---`);
  
  let assignedDriverToken = driverRameshToken;
  if (targetDriver.email && targetDriver.email !== 'ramesh@primeroute.com') {
    assignedDriverToken = await login(targetDriver.email, 'Driver@2026!');
    console.log(`   ✓ Authenticated assigned driver ${targetDriver.email}`);
  }

  // Driver sees active delivery
  const driverActiveRes = await request('/driver/deliveries/active', {
    headers: { Authorization: `Bearer ${assignedDriverToken}` },
  });
  assert.strictEqual(driverActiveRes.status, 200);
  const activeDelivery = driverActiveRes.data.data;
  assert(activeDelivery, 'Driver must have active delivery');
  console.log('   ✓ Driver Active Shipment:', activeDelivery.trackingNumber, 'Status:', activeDelivery.status);
  assert.strictEqual(activeDelivery.trackingNumber, blrShipment.trackingNumber);

  // Driver Starts Trip
  console.log('   Driver Starts Trip (IN_TRANSIT)...');
  const startTripRes = await request(`/driver/deliveries/${activeDelivery.id}/start-trip`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${assignedDriverToken}` },
  });
  assert.strictEqual(startTripRes.status, 200);
  console.log('   ✓ Trip Started. Status:', startTripRes.data.data.status);

  // Driver Broadcasts Live GPS Telemetry
  console.log('   Driver Broadcasts Real-Time GPS Telemetry...');
  const gpsLat = 13.0358;
  const gpsLng = 77.5970;
  const gpsLocationName = 'Bellary Road Express Highway, Bengaluru';
  
  const gpsRes = await request('/driver/location', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${assignedDriverToken}`,
    },
    body: JSON.stringify({
      latitude: gpsLat,
      longitude: gpsLng,
      locationName: gpsLocationName,
      shipmentId: Number(activeDelivery.id),
      speed: 62.5,
      heading: 45.0,
      accuracy: 5.0,
    }),
  });
  assert.strictEqual(gpsRes.status, 200);
  console.log('   ✓ GPS Telemetry broadcasted successfully');

  // Verify single source of truth across Warehouse and Customer!
  console.log('\n--- 7. Single Source of Truth GPS Verification ---');
  
  // Check from Warehouse Manager view
  const wmGpsShipment = (await request(`/warehouse-manager/shipments/${activeDelivery.id}`, {
    headers: { Authorization: `Bearer ${wmBlrToken}` },
  })).data.data;
  console.log(`   ✓ Warehouse GPS: Lat ${wmGpsShipment.currentLatitude}, Lng ${wmGpsShipment.currentLongitude}, Location: ${wmGpsShipment.currentLocationName}`);
  assert.strictEqual(Number(wmGpsShipment.currentLatitude), gpsLat);
  assert.strictEqual(Number(wmGpsShipment.currentLongitude), gpsLng);

  // Check from Customer Tracking view
  const custTrackingRes = await request(`/customer/shipments/track/${activeDelivery.trackingNumber}`, {
    headers: { Authorization: `Bearer ${custToken}` },
  });
  assert.strictEqual(custTrackingRes.status, 200);
  const custTrack = custTrackingRes.data.data;
  console.log(`   ✓ Customer GPS: Lat ${custTrack.currentLatitude}, Lng ${custTrack.currentLongitude}, Location: ${custTrack.currentLocationName}`);
  assert.strictEqual(Number(custTrack.currentLatitude), gpsLat);
  assert.strictEqual(Number(custTrack.currentLongitude), gpsLng);

  // -------------------------------------------------------------
  // 8. OUT FOR DELIVERY & ePOD COMPLETION
  // -------------------------------------------------------------
  console.log('\n--- 8. Out for Delivery & ePOD Completion ---');
  const ofdRes = await request(`/driver/deliveries/${activeDelivery.id}/out-for-delivery`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${assignedDriverToken}` },
  });
  assert.strictEqual(ofdRes.status, 200);
  console.log('   ✓ Driver status updated to OUT_FOR_DELIVERY');

  // Driver Completes Electronic Proof of Delivery (ePOD)
  console.log('   Submitting ePOD...');
  const epodRes = await request(`/driver/deliveries/${activeDelivery.id}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${assignedDriverToken}`,
    },
    body: JSON.stringify({
      recipientName: 'Kolkata Consignee Representative',
      receivedBy: 'Kolkata Consignee Representative',
      signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      deliveryNotes: 'Verified carton seals intact and signed upon gate receipt.',
    }),
  });
  assert.strictEqual(epodRes.status, 200);
  console.log('   ✓ Delivery completed with verified ePOD. Status:', epodRes.data.data.status);

  // -------------------------------------------------------------
  // 9. VERIFYING POST-DELIVERY ENTITIES
  // -------------------------------------------------------------
  console.log('\n--- 9. Verifying Post-Delivery Entities ---');
  
  // Shipment in DB is DELIVERED
  const finalShipment = (await request(`/warehouse-manager/shipments/${activeDelivery.id}`, {
    headers: { Authorization: `Bearer ${wmBlrToken}` },
  })).data.data;
  console.log('   ✓ Final Shipment Status:', finalShipment.status);
  assert.strictEqual(finalShipment.status, 'DELIVERED');

  // Order in DB is DELIVERED
  const finalOrder = (await request(`/customer/orders/${orderBlr.id}`, {
    headers: { Authorization: `Bearer ${custToken}` },
  })).data.data;
  console.log('   ✓ Final Order Status:', finalOrder.status);
  assert.strictEqual(finalOrder.status, 'DELIVERED');

  // Customer tracking reflects DELIVERED
  const finalCustTrack = (await request(`/customer/shipments/track/${activeDelivery.trackingNumber}`, {
    headers: { Authorization: `Bearer ${custToken}` },
  })).data.data;
  console.log('   ✓ Customer Tracking Status:', finalCustTrack.status);
  assert.strictEqual(finalCustTrack.status, 'DELIVERED');

  // Driver Profile Status is AVAILABLE / ON_DUTY
  const driverProf = (await request('/driver/me', {
    headers: { Authorization: `Bearer ${driverRameshToken}` },
  })).data.data;
  console.log('   ✓ Driver Profile Status:', driverProf.status, 'Completed Trips:', driverProf.totalTripsCompleted);

  // -------------------------------------------------------------
  // 10. SECURITY AND AUTHORIZATION MATRIX
  // -------------------------------------------------------------
  console.log('\n--- 10. Security & Authorization Matrix ---');
  
  // Unauthenticated -> 401
  const unauth = await request('/driver/me');
  console.log('   ✓ Unauthenticated access status:', unauth.status, '(401 Expected)');
  assert.strictEqual(unauth.status, 401);

  // Customer on Driver API -> 403
  const custOnDriver = await request('/driver/me', { headers: { Authorization: `Bearer ${custToken}` } });
  console.log('   ✓ Customer on /api/driver/me status:', custOnDriver.status, '(403 Expected)');
  assert.strictEqual(custOnDriver.status, 403);

  // Driver on Customer Notifications -> 403
  const driverOnCustNotif = await request('/customer/notifications', { headers: { Authorization: `Bearer ${driverRameshToken}` } });
  console.log('   ✓ Driver on /api/customer/notifications status:', driverOnCustNotif.status, '(403 Expected)');
  assert.strictEqual(driverOnCustNotif.status, 403);

  // Driver on Warehouse API -> 403
  const driverOnWm = await request('/warehouse-manager/orders', { headers: { Authorization: `Bearer ${driverRameshToken}` } });
  console.log('   ✓ Driver on /api/warehouse-manager/orders status:', driverOnWm.status, '(403 Expected)');
  assert.strictEqual(driverOnWm.status, 403);

  // Warehouse Manager on Admin API -> 403
  const wmOnAdmin = await request('/admin/settings', { headers: { Authorization: `Bearer ${wmBlrToken}` } });
  console.log('   ✓ Warehouse Manager on /api/admin/settings status:', wmOnAdmin.status, '(403 Expected)');
  assert.strictEqual(wmOnAdmin.status, 403);

  console.log('\n================================================================');
  console.log('ALL AUDIT CRITERIA PASSED WITH ZERO ERRORS & ZERO FAILURES!');
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('\n❌ E2E AUDIT FAILED:', err);
  process.exit(1);
});
