const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
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

async function run() {
  console.log('=== TEST 1: Driver Login (ramesh@primeroute.com) ===');
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'ramesh@primeroute.com', password: 'Driver@2026!' }
  );
  console.log('Login status:', loginRes.status);
  console.log('Login role:', loginRes.data.role);
  const token = loginRes.data.token;
  if (!token) {
    console.error('No token received!');
    return;
  }

  const driverHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  console.log('\n=== TEST 2: GET /api/driver/me ===');
  const meRes = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/driver/me',
      method: 'GET',
      headers: driverHeaders,
    }
  );
  console.log('Driver Profile status:', meRes.status);
  console.log('Driver Profile data:', JSON.stringify(meRes.data, null, 2));

  console.log('\n=== TEST 3: GET /api/driver/vehicle ===');
  const vehRes = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/driver/vehicle',
      method: 'GET',
      headers: driverHeaders,
    }
  );
  console.log('Vehicle status:', vehRes.status);
  console.log('Vehicle data:', JSON.stringify(vehRes.data, null, 2));

  console.log('\n=== TEST 4: GET /api/driver/dashboard ===');
  const dashRes = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/driver/dashboard',
      method: 'GET',
      headers: driverHeaders,
    }
  );
  console.log('Dashboard status:', dashRes.status);
  console.log('Dashboard data:', JSON.stringify(dashRes.data, null, 2));

  console.log('\n=== TEST 5: GET /api/driver/deliveries ===');
  const delsRes = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/driver/deliveries',
      method: 'GET',
      headers: driverHeaders,
    }
  );
  console.log('Deliveries status:', delsRes.status);
  console.log('Deliveries count:', delsRes.data.data ? delsRes.data.data.length : 0);

  console.log('\n=== TEST 6: GET /api/driver/deliveries/active ===');
  const activeRes = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/driver/deliveries/active',
      method: 'GET',
      headers: driverHeaders,
    }
  );
  console.log('Active delivery status:', activeRes.status);
  console.log('Active delivery data:', JSON.stringify(activeRes.data, null, 2));

  console.log('\n=== TEST 7: Unauthorized Access (No Token) ===');
  const noAuthRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/driver/me',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  console.log('No-auth status (expect 401):', noAuthRes.status);

  console.log('\n=== TEST 8: Customer Access to Driver Endpoint ===');
  const custLogin = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'routjig09@gmail.com', password: 'Customer@123' }
  );
  if (custLogin.data.token) {
    const custRes = await request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/driver/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${custLogin.data.token}` },
    });
    console.log('Customer accessing driver endpoint status (expect 403):', custRes.status);
  }
}

run().catch(console.error);
