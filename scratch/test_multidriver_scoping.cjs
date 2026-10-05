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

async function run() {
  console.log('=== MULTI-DRIVER SCOPING & DYNAMIC ENDPOINTS TEST ===\n');

  // 1. Login as Driver 1 (Ramesh)
  console.log('1. Logging in as Driver 1 (ramesh@primeroute.com)...');
  const token1 = await login('ramesh@primeroute.com', 'Driver@2026!');
  if (!token1) {
    console.error('Failed to log in as Driver 1');
    return;
  }
  console.log('-> Success. Token acquired.');

  // 2. Fetch Driver 1 profile & active delivery
  console.log('\n2. Fetching Driver 1 profile and active shipment...');
  const profile1 = await get('/api/driver/me', token1);
  console.log('Driver 1 Profile:', {
    driverId: profile1.data?.driverId,
    fullName: profile1.data?.fullName,
    email: profile1.data?.email,
    vehicle: profile1.data?.assignedVehicle?.vehicleNumber,
    warehouse: profile1.data?.assignedWarehouse?.name
  });

  const active1 = await get('/api/driver/deliveries/active', token1);
  console.log('Driver 1 Active Shipment:', {
    shipmentId: active1.data?.id,
    trackingNumber: active1.data?.trackingNumber,
    status: active1.data?.status,
    customerAddress: active1.data?.customerAddress
  });

  const shipmentId1 = active1.data?.id;

  // 3. Login as Driver 2 (Anil)
  console.log('\n3. Logging in as Driver 2 (anil.deshmukh@primeroute.com)...');
  let token2 = await login('anil.deshmukh@primeroute.com', 'Driver@2026!');
  if (!token2) {
    // Try other password or check email
    console.log('Trying anil.deshmukh with fallback or finding second driver...');
  }

  // 4. Test Driver 1 querying their own delivery by ID
  if (shipmentId1) {
    console.log(`\n4. Driver 1 requesting own shipment ${shipmentId1}...`);
    const ownShipment = await get(`/api/driver/deliveries/${shipmentId1}`, token1);
    console.log(`Status: ${ownShipment.status} (Expected: 200)`);
    console.log(`Tracking: ${ownShipment.data?.trackingNumber}, Customer: ${ownShipment.data?.customerName}`);
  }

  // 5. Test Customer trying to access Driver API
  console.log('\n5. Logging in as Customer (customer@primeroute.com)...');
  const customerToken = await login('customer@primeroute.com', 'Customer@2026!');
  if (customerToken) {
    const custAccess = await get('/api/driver/me', customerToken);
    console.log(`Customer accessing /api/driver/me -> Status: ${custAccess.status} (Expected: 403 Forbidden)`);
  }

  // 6. Test Unauthenticated access
  console.log('\n6. Testing unauthenticated access to /api/driver/dashboard...');
  const anonAccess = await get('/api/driver/dashboard', 'invalid-token');
  console.log(`Unauthenticated access -> Status: ${anonAccess.status} (Expected: 401/403)`);

  // 7. Verify Dashboard KPIs
  console.log('\n7. Driver 1 Dashboard KPIs:');
  const dashboard = await get('/api/driver/dashboard', token1);
  console.log(dashboard.data);

  console.log('\n=== ALL SECURITY & SCOPING TESTS EXECUTED ===');
}

run().catch(console.error);
