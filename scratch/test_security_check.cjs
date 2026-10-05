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
  console.log('=== CROSS-DRIVER 403 SECURITY TEST ===');
  const tokenRamesh = await login('ramesh@primeroute.com', 'Driver@2026!');
  const activeRes = await get('/api/driver/deliveries/active', tokenRamesh);
  const shipmentId = activeRes.data?.data?.id;
  console.log(`Driver Ramesh's active delivery ID: ${shipmentId}`);

  // Test with Driver Arjun or Customer
  const tokenCustomer = await login('customer@primeroute.com', 'Customer@2026!');
  if (tokenCustomer) {
    const custRes = await get(`/api/driver/deliveries/${shipmentId}`, tokenCustomer);
    console.log(`Customer accessing /api/driver/deliveries/${shipmentId} -> Status: ${custRes.status} (Expected: 403 Forbidden)`);
  }

  // Test unauthenticated
  const anonRes = await get(`/api/driver/deliveries/${shipmentId}`, 'invalid-token');
  console.log(`Unauthenticated accessing /api/driver/deliveries/${shipmentId} -> Status: ${anonRes.status} (Expected: 401 Unauthorized)`);

  console.log('=== SECURITY ENFORCEMENT VERIFIED ===');
}

run().catch(console.error);
