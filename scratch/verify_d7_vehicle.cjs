const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
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
  return { status: res.status, token: res.data?.data?.token || res.data?.token };
}

async function run() {
  console.log('=== 1. VERIFYING UNASSIGNED / UNAUTHENTICATED ACCESS ===');
  const unauthRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/driver/vehicle',
    method: 'GET'
  });
  console.log('Unauthenticated GET /api/driver/vehicle status:', unauthRes.status, '(Expected 401/403)');

  console.log('\n=== 2. VERIFYING RAMESH KUMAR VEHICLE DATA (Bengaluru Hub) ===');
  const rameshLogin = await login('ramesh@primeroute.com', 'Driver@2026!');
  const rameshVeh = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/driver/vehicle',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${rameshLogin.token}` }
  });
  console.log('Ramesh Vehicle Status:', rameshVeh.status);
  console.log('Ramesh Vehicle Data:', JSON.stringify(rameshVeh.data, null, 2));

  console.log('\n=== 3. VERIFYING PRIYA PATEL VEHICLE DATA (Kolkata Hub) ===');
  const priyaLogin = await login('priya.patel@primeroute.in', 'Driver@2026!');
  const priyaVeh = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/driver/vehicle',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${priyaLogin.token}` }
  });
  console.log('Priya Vehicle Status:', priyaVeh.status);
  console.log('Priya Vehicle Data:', JSON.stringify(priyaVeh.data, null, 2));

  console.log('\n=== 4. VERIFYING WAREHOUSE MANAGER RESTRICTION ===');
  const whLogin = await login('warehouse.blr@primeroute.com', 'Manager@2026!');
  if (whLogin.token) {
    const whVeh = await request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/driver/vehicle',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${whLogin.token}` }
    });
    console.log('Warehouse Manager Access Status:', whVeh.status, '(Expected 403)');
  }
}

run().catch(console.error);
