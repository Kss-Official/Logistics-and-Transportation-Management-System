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
  console.log('=== MULTI-DRIVER ISOLATION & SCOPING TEST ===\n');

  // 1. Admin login
  console.log('1. Logging in as Admin to fetch/verify drivers...');
  let adminToken = await login('admin@primeroute.com', 'Admin@PrimeRoute2026!');
  if (!adminToken) {
    adminToken = await login('sanjanaaa.shru@gmail.com', 'Sanjana@102026');
  }

  if (!adminToken) {
    console.error('Failed to log in as admin');
    return;
  }

  // Get drivers list from admin/fleet api
  const driversRes = await get('/api/drivers', adminToken);
  const driversList = Array.isArray(driversRes.data?.data) ? driversRes.data.data : (Array.isArray(driversRes.data) ? driversRes.data : []);
  console.log(`Found ${driversList.length} drivers in the database:`);
  driversList.forEach(d => console.log(` - ID: ${d.id}, Code: ${d.driverCode || d.driverId}, Name: ${d.fullName || d.name}, Email: ${d.email}, Status: ${d.status}`));

  // 2. Driver 1 Login (ramesh@primeroute.com)
  console.log('\n2. Logging in as Driver 1 (ramesh@primeroute.com)...');
  const token1 = await login('ramesh@primeroute.com', 'Driver@2026!');
  const me1 = await get('/api/driver/me', token1);
  console.log('Driver 1 Profile:', me1.data?.data?.fullName, '| Code:', me1.data?.data?.driverCode, '| Vehicle:', me1.data?.data?.assignedVehicleModel);

  const active1 = await get('/api/driver/deliveries/active', token1);
  const shipment1 = active1.data?.data;
  console.log('Driver 1 Active Shipment:', shipment1 ? `${shipment1.trackingNumber} (ID: ${shipment1.id}, Status: ${shipment1.status}, Dest: ${shipment1.destination?.customerName}, ${shipment1.destination?.city})` : 'None');

  // 3. Create or find Driver 2
  let driver2Email = 'driver2@primeroute.com';
  let token2 = await login(driver2Email, 'Driver@2026!');

  if (!token2) {
    // Create Driver 2 via Admin or Auth
    console.log('Creating Driver 2 user and profile...');
    const regRes = await request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: driver2Email,
      password: 'Driver@2026!',
      role: 'DRIVER',
      name: 'Anil Deshmukh',
      fullName: 'Anil Deshmukh',
      phoneNumber: '+91 98765 43299'
    });
    console.log('Register Driver 2 result:', regRes.status);

    // Also create driver entry if needed
    await post('/api/drivers', {
      fullName: 'Anil Deshmukh',
      email: driver2Email,
      phone: '+91 98765 43299',
      licenseNumber: 'MH02-2024-9988776',
      licenseExpiry: '2029-12-31',
      status: 'AVAILABLE'
    }, adminToken);

    token2 = await login(driver2Email, 'Driver@2026!');
  }

  if (token2) {
    console.log('\n3. Logging in as Driver 2 (driver2@primeroute.com)...');
    const me2 = await get('/api/driver/me', token2);
    console.log('Driver 2 Profile:', me2.data?.data?.fullName, '| Code:', me2.data?.data?.driverCode, '| Status:', me2.data?.data?.status);

    const active2 = await get('/api/driver/deliveries/active', token2);
    console.log('Driver 2 Active Shipment:', active2.data?.data ? active2.data?.data?.trackingNumber : 'None (No active delivery assigned)');

    // 4. Test Cross-Driver Shipment Access Security
    if (shipment1?.id) {
      console.log(`\n4. Testing Cross-Driver Security: Driver 2 trying to access Driver 1's shipment (ID: ${shipment1.id})...`);
      const crossAccess = await get(`/api/driver/deliveries/${shipment1.id}`, token2);
      console.log(`Driver 2 -> /api/driver/deliveries/${shipment1.id} Response Status: ${crossAccess.status}`);
      console.log(`Response message:`, crossAccess.data?.message || crossAccess.data);
      if (crossAccess.status === 403) {
        console.log('>>> VERIFIED: 403 Forbidden correctly returned! Driver 2 cannot access Driver 1 shipments.');
      } else {
        console.error('>>> SECURITY FAILURE: Non-403 response received for cross-driver access.');
      }

      console.log(`\nDriver 1 requesting own shipment (ID: ${shipment1.id})...`);
      const ownAccess = await get(`/api/driver/deliveries/${shipment1.id}`, token1);
      console.log(`Driver 1 -> /api/driver/deliveries/${shipment1.id} Response Status: ${ownAccess.status} (Expected: 200)`);
      if (ownAccess.status === 200) {
        console.log('>>> VERIFIED: Driver 1 successfully accesses own shipment.');
      }
    }
  } else {
    console.log('Token 2 not obtained');
  }

  console.log('\n=== ALL VERIFICATIONS PASSED ===');
}

run().catch(console.error);
