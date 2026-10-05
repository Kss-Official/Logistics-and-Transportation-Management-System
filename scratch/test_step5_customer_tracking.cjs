const http = require('http');

function apiRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: json, raw: body });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
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

async function login(email, password) {
  const res = await apiRequest(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email, password }
  );
  return res.data?.token || res.data?.data?.token;
}

async function registerCustomer(email, password, fullName) {
  const regRes = await apiRequest(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      email,
      password,
      fullName,
      phone: '+919876543210',
    }
  );
  return regRes;
}

async function runTests() {
  console.log('========================================================================');
  console.log('STEP 5: CUSTOMER LIVE SHIPMENT TRACKING & SECURITY VERIFICATION');
  console.log('========================================================================\n');

  await registerCustomer('customer2@primeroute.com', 'Driver@2026!', 'Secondary Customer');

  // 1. Authenticate users
  console.log('--- 1. Authenticating Roles ---');
  const cust1Token = await login('shrutisanjanasahoo@gmail.com', 'Driver@2026!');
  const cust2Token = await login('customer2@primeroute.com', 'Driver@2026!');
  const adminToken = await login('admin@primeroute.com', 'Driver@2026!');
  const wmToken = await login('priya@primeroute.com', 'Driver@2026!');
  const driverToken = await login('ramesh@primeroute.com', 'Driver@2026!');

  console.log('Customer 1 (Owner):', cust1Token ? '✓ Auth Success' : '✗ Failed');
  console.log('Customer 2 (Other Customer):', cust2Token ? '✓ Auth Success' : '✗ Failed');
  console.log('Driver 1 (Ramesh):', driverToken ? '✓ Auth Success' : '✗ Failed');
  console.log('Warehouse Manager:', wmToken ? '✓ Auth Success' : '✗ Failed');
  console.log('Admin:', adminToken ? '✓ Auth Success' : '✗ Failed');

  // 2. Fetch Customer 1's shipments
  console.log('\n--- 2. Querying Customer 1 Shipments ---');
  const custShipmentsRes = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/customer/shipments',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${cust1Token}`,
    },
  });

  console.log('Customer 1 Shipments Status:', custShipmentsRes.status);
  const shipments = custShipmentsRes.data?.data || [];
  console.log(`Found ${shipments.length} shipment(s) for Customer 1`);

  let targetShipment = shipments.find((s) => s.status === 'IN_TRANSIT' || s.status === 'OUT_FOR_DELIVERY');
  if (!targetShipment && shipments.length > 0) {
    targetShipment = shipments[0];
  }

  const shipmentId = targetShipment.id;
  const trackingNumber = targetShipment.trackingNumber;
  console.log(`Target Shipment: ID=${shipmentId}, TrackingNumber=${trackingNumber}, Status=${targetShipment.status}`);

  // 3. Driver broadcasts new GPS coordinates
  console.log('\n--- 3. Driver Broadcasting Real Telemetry Coordinates ---');
  const driverTelemetryPayload = {
    shipmentId: shipmentId,
    latitude: 12.9348,
    longitude: 77.6189,
    accuracy: 4.8,
    speed: 38.5,
    heading: 95.0,
    locationName: 'Koramangala 80ft Road Express Corridor',
    timestamp: new Date().toISOString(),
  };

  const driverGpsRes = await apiRequest(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/driver/location',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${driverToken}`,
      },
    },
    driverTelemetryPayload
  );

  console.log('Driver Telemetry Update Response:', driverGpsRes.status, driverGpsRes.data?.message || '');

  // 4. Customer 1 (Owner) tracks own shipment
  console.log('\n--- 4. Customer 1 (Owner) Tracking Shipment ---');
  const custTrackRes = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: `/api/customer/shipments/track/${trackingNumber}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${cust1Token}`,
    },
  });

  console.log('Customer 1 Track Status:', custTrackRes.status);
  const trackData = custTrackRes.data?.data;
  console.log('Customer 1 Received Tracking Telemetry:', {
    shipmentId: trackData?.shipmentId,
    trackingNumber: trackData?.trackingNumber,
    orderNumber: trackData?.orderNumber,
    status: trackData?.status,
    driverName: trackData?.driverName,
    vehicleNumber: trackData?.vehicleNumber,
    currentLatitude: trackData?.currentLatitude,
    currentLongitude: trackData?.currentLongitude,
    currentLocationName: trackData?.currentLocationName,
    lastLocationUpdatedAt: trackData?.lastLocationUpdatedAt,
    destinationAddress: trackData?.destinationAddress || trackData?.delivery?.addressText,
  });

  // Verify numerical ID endpoint
  const custTrackByIdRes = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: `/api/customer/shipments/${shipmentId}/tracking`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${cust1Token}`,
    },
  });
  console.log(`Customer 1 Track by ID (${shipmentId}) Status:`, custTrackByIdRes.status);

  // 5. Security Testing: Ownership Enforcement
  console.log('\n--- 5. Security & Ownership Enforcement Verification ---');

  // Customer 2 querying Customer 1's shipment
  const cust2ForeignRes = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: `/api/customer/shipments/track/${trackingNumber}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${cust2Token}`,
    },
  });
  console.log('[Customer 2 (Other Customer) -> Customer 1 Shipment]: HTTP Status:', cust2ForeignRes.status, '(Expected: 403 Forbidden)');

  // Customer 2 querying Customer 1's shipment by ID
  const cust2ForeignIdRes = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: `/api/customer/shipments/${shipmentId}/tracking`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${cust2Token}`,
    },
  });
  console.log('[Customer 2 (Other Customer) -> Customer 1 Shipment By ID]: HTTP Status:', cust2ForeignIdRes.status, '(Expected: 403 Forbidden)');

  // Unauthenticated querying customer tracking
  const unauthRes = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: `/api/customer/shipments/track/${trackingNumber}`,
    method: 'GET',
  });
  console.log('[Unauthenticated -> Customer Tracking]: HTTP Status:', unauthRes.status, '(Expected: 401 Unauthorized)');

  // Warehouse manager trying to query customer tracking API as customer
  const wmCustRes = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: `/api/customer/shipments/track/${trackingNumber}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${wmToken}`,
    },
  });
  console.log('[Warehouse Manager -> Customer Tracking API]: HTTP Status:', wmCustRes.status, '(Expected: 403 Forbidden)');

  // Non-existent tracking number
  const nonExistentRes = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/customer/shipments/track/PR-TRK-DOESNOTEXIST99',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${cust1Token}`,
    },
  });
  console.log('[Invalid Tracking Number Query]: HTTP Status:', nonExistentRes.status, '(Expected: 404 Not Found)');

  // 6. Coordinates Match Verification
  console.log('\n--- 6. Single Source of Truth Verification ---');
  console.log('Driver Broadcasted Lat/Lng:', driverTelemetryPayload.latitude, driverTelemetryPayload.longitude);
  console.log('Customer Received Lat/Lng:', trackData?.currentLatitude, trackData?.currentLongitude);
  const coordsMatch =
    trackData?.currentLatitude === driverTelemetryPayload.latitude &&
    trackData?.currentLongitude === driverTelemetryPayload.longitude;
  console.log('Exact Coordinate Match:', coordsMatch ? '✓ PASS' : '✗ MISMATCH');

  console.log('\n========================================================================');
  console.log('ALL STEP 5 CUSTOMER LIVE SHIPMENT TRACKING VERIFICATIONS COMPLETE!');
  console.log('========================================================================');
}

runTests().catch(console.error);
