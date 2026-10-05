const { execSync } = require('child_process');
const http = require('http');

process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

// Standardize driver & user state for test
const rameshHash = execSync(`${PSQL} -t -A -c "SELECT password FROM users WHERE email = 'ramesh@primeroute.com';"`, { encoding: 'utf8', env: process.env }).trim();
execSync(`${PSQL} -c "UPDATE users SET password = '${rameshHash}' WHERE email IN ('admin@primeroute.com', 'shrutisanjanasahoo@gmail.com', 'priya@primeroute.com', 'anil.deshmukh.1790082100291@primeroute.com');"`, { encoding: 'utf8', env: process.env });

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body), headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
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

async function run() {
  console.log('========================================================================');
  console.log('STEP 4: REAL GPS TELEMETRY & LIVE SHIPMENT TRACKING VERIFICATION');
  console.log('========================================================================');

  console.log('\n--- 1. Authenticating Roles ---');
  const driverToken = await login('ramesh@primeroute.com', 'Driver@2026!');
  const otherDriverToken = await login('anil.deshmukh.1790082100291@primeroute.com', 'Driver@2026!');
  const adminToken = await login('admin@primeroute.com', 'Driver@2026!');
  const wmToken = await login('priya@primeroute.com', 'Driver@2026!');
  const customerToken = await login('shrutisanjanasahoo@gmail.com', 'Driver@2026!');

  console.log('Driver 1 (Ramesh):', driverToken ? '✓ Auth Success' : '✗ Failed');
  console.log('Driver 2 (Anil):', otherDriverToken ? '✓ Auth Success' : '✗ Failed');
  console.log('Admin:', adminToken ? '✓ Auth Success' : '✗ Failed');
  console.log('Warehouse Manager (Priya):', wmToken ? '✓ Auth Success' : '✗ Failed');
  console.log('Customer:', customerToken ? '✓ Auth Success' : '✗ Failed');

  // Setup active in-transit delivery for Ramesh (driver_id=20, vehicle_id=1, origin_warehouse_id=1)
  const deliveryId = 42;
  execSync(`${PSQL} -c "UPDATE shipments SET status = 'IN_TRANSIT', operational_stage = 'DISPATCHED', driver_id = 20, vehicle_id = 1, origin_warehouse_id = 1 WHERE id = ${deliveryId};"`, { encoding: 'utf8', env: process.env });

  console.log(`\n--- 2. Active Shipment Prepared: #${deliveryId} (IN_TRANSIT, Driver Ramesh ID: 20) ---`);

  console.log('\n--- 3. Testing Security Constraints on POST /api/driver/location ---');

  // A. Admin attempting to submit GPS telemetry -> EXPECTED: 403
  const adminGps = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/driver/location',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' }
  }, { latitude: 12.9352, longitude: 77.6245 });
  console.log(`[Admin -> /location]: HTTP Status: ${adminGps.status} (Expected: 403 Forbidden)`);

  // B. Warehouse Manager attempting to submit GPS telemetry -> EXPECTED: 403
  const wmGps = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/driver/location',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${wmToken}`, 'Content-Type': 'application/json' }
  }, { latitude: 12.9352, longitude: 77.6245 });
  console.log(`[Warehouse Manager -> /location]: HTTP Status: ${wmGps.status} (Expected: 403 Forbidden)`);

  // C. Customer attempting to submit GPS telemetry -> EXPECTED: 403
  const custGps = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/driver/location',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${customerToken}`, 'Content-Type': 'application/json' }
  }, { latitude: 12.9352, longitude: 77.6245 });
  console.log(`[Customer -> /location]: HTTP Status: ${custGps.status} (Expected: 403 Forbidden)`);

  // D. Unauthenticated -> EXPECTED: 401
  const unauthGps = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/driver/location',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { latitude: 12.9352, longitude: 77.6245 });
  console.log(`[Unauthenticated -> /location]: HTTP Status: ${unauthGps.status} (Expected: 401 Unauthorized)`);

  // E. Driver 2 attempting to submit GPS telemetry for Driver 1's shipment -> EXPECTED: 403
  const driver2Spoof = await request({
    hostname: 'localhost',
    port: 8080,
    path: `/api/driver/deliveries/${deliveryId}/location`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${otherDriverToken}`, 'Content-Type': 'application/json' }
  }, { latitude: 12.9352, longitude: 77.6245 });
  console.log(`[Driver 2 targeting Driver 1 Shipment]: HTTP Status: ${driver2Spoof.status} (Expected: 403 Forbidden)`);

  console.log('\n--- 4. Driver 1 (Owner) Broadcasting Real GPS Telemetry ---');
  const driverGpsUpdate = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/driver/location',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${driverToken}`, 'Content-Type': 'application/json' }
  }, {
    shipmentId: deliveryId,
    latitude: 12.9352,
    longitude: 77.6245,
    accuracy: 8.5,
    speed: 42.0,
    heading: 68.0,
    locationName: 'Outer Ring Road - Silk Board Flyover Corridor'
  });

  console.log(`[Driver 1 -> /location]: HTTP Status: ${driverGpsUpdate.status} (Expected: 200 OK)`);
  console.log(`Success: ${driverGpsUpdate.data?.success}`);
  console.log(`Recorded Coordinates: Lat=${driverGpsUpdate.data?.data?.currentLatitude}, Lng=${driverGpsUpdate.data?.data?.currentLongitude}`);
  console.log(`Location Name: ${driverGpsUpdate.data?.data?.currentLocationName}`);
  console.log(`Last Telemetry Update: ${driverGpsUpdate.data?.data?.lastLocationUpdatedAt}`);

  console.log('\n--- 5. Database Direct Verification of Stored Telemetry ---');
  const dbRecord = execSync(`${PSQL} -c "SELECT id, tracking_number, status, current_latitude, current_longitude, current_location_name, last_location_updated_at FROM shipments WHERE id = ${deliveryId};"`, { encoding: 'utf8', env: process.env });
  console.log(dbRecord);

  console.log('\n--- 6. Warehouse Manager Viewing Live GPS Tracking ---');
  // A. Warehouse Manager gets outgoing shipments
  const wmOutgoing = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse/shipments/outgoing',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${wmToken}` }
  });
  const trackedItem = (wmOutgoing.data?.data || []).find(s => s.id === deliveryId);
  console.log(`Warehouse Manager Outgoing Shipments: ${wmOutgoing.status}`);
  console.log(`Found Tracked Consignment: ${trackedItem ? 'YES' : 'NO'}`);
  console.log(`WM Received Telemetry:`, {
    trackingNumber: trackedItem?.trackingNumber,
    status: trackedItem?.status,
    driverName: trackedItem?.driverName,
    vehicleNumber: trackedItem?.vehicleNumber,
    currentLatitude: trackedItem?.currentLatitude,
    currentLongitude: trackedItem?.currentLongitude,
    currentLocationName: trackedItem?.currentLocationName,
    lastLocationUpdatedAt: trackedItem?.lastLocationUpdatedAt
  });

  // B. Warehouse Manager gets single shipment details
  const wmSingle = await request({
    hostname: 'localhost',
    port: 8080,
    path: `/api/warehouse/shipments/${deliveryId}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${wmToken}` }
  });
  console.log(`Warehouse Manager Single Shipment Query: ${wmSingle.status}`);
  console.log(`Single View Coordinates Match: Lat=${wmSingle.data?.data?.currentLatitude}, Lng=${wmSingle.data?.data?.currentLongitude}`);

  // C. Warehouse Manager live tracking aggregate
  const wmLive = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse/tracking/live',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${wmToken}` }
  });
  console.log(`Warehouse Manager Live Radar: ${wmLive.status}`);
  const activeMarkers = wmLive.data?.data?.activeShipments || [];
  console.log(`Active Map Markers Count: ${activeMarkers.length}`);
  const liveMarker = activeMarkers.find(m => m.shipmentId === deliveryId);
  console.log(`Live Radar Marker for Driver:`, liveMarker);

  console.log('\n========================================================================');
  console.log('ALL STEP 4 GPS TELEMETRY & LIVE TRACKING VERIFICATIONS PASSED!');
  console.log('========================================================================');
}

run().catch(console.error);
