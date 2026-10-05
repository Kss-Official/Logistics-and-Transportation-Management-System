const http = require('http');

function apiRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
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

async function runTests() {
  console.log('====================================================');
  console.log('PRIMEROUTE LOGISTICS - COMPLETE AUTHENTICATION MATRIX');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name, condition, extra = '') {
    if (condition) {
      console.log(`[PASS] ${name} ${extra}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${extra}`);
      failed++;
    }
  }

  // 1. Customer Login
  console.log('--- 1. Customer Login (shrutisanjanasahoo@gmail.com) ---');
  const custRes = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'shrutisanjanasahoo@gmail.com', password: 'Driver@2026!' });

  assert('Customer Login Status is 200', custRes.status === 200, `(Status: ${custRes.status})`);
  assert('Customer JWT returned', typeof custRes.data?.token === 'string' && custRes.data?.token.length > 20);
  assert('Customer Role is ROLE_CUSTOMER', custRes.data?.role === 'ROLE_CUSTOMER', `(Role: ${custRes.data?.role})`);
  const custToken = custRes.data?.token;

  // 2. Email Normalization & Case Insensitivity
  console.log('\n--- 2. Email Normalization & Case Insensitivity ---');
  const custUpperRes = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: '  SHRUTISANJANASAHOO@GMAIL.COM  ', password: 'Driver@2026!' });
  assert('Uppercase & whitespace email authenticates successfully', custUpperRes.status === 200 && custUpperRes.data?.role === 'ROLE_CUSTOMER');

  // 3. Warehouse Manager Login
  console.log('\n--- 3. Warehouse Manager Login (priya@primeroute.com) ---');
  const whRes = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'priya@primeroute.com', password: 'Manager@2026!' });

  assert('Warehouse Manager Login Status is 200', whRes.status === 200, `(Status: ${whRes.status})`);
  assert('Warehouse Manager JWT returned', typeof whRes.data?.token === 'string' && whRes.data?.token.length > 20);
  assert('Warehouse Manager Role is ROLE_WAREHOUSE_MANAGER', whRes.data?.role === 'ROLE_WAREHOUSE_MANAGER');
  assert('Warehouse Info preserved', whRes.data?.warehouseCode === 'WH-BLR-001' && whRes.data?.warehouseId === 1, `(Warehouse: ${whRes.data?.warehouseCode})`);
  const whToken = whRes.data?.token;

  // 4. Admin Login
  console.log('\n--- 4. Admin Login (admin@primeroute.com) ---');
  const adminRes = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@primeroute.com', password: 'Admin@2026!' });

  assert('Admin Login Status is 200', adminRes.status === 200);
  assert('Admin Role is ROLE_ADMIN', adminRes.data?.role === 'ROLE_ADMIN');
  const adminToken = adminRes.data?.token;

  // 5. Driver Login
  console.log('\n--- 5. Driver Login (ramesh@primeroute.com) ---');
  const driverRes = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'ramesh@primeroute.com', password: 'Driver@2026!' });

  assert('Driver Login Status is 200', driverRes.status === 200);
  assert('Driver Role is ROLE_DRIVER', driverRes.data?.role === 'ROLE_DRIVER');
  const driverToken = driverRes.data?.token;

  // 6. Security & Authorization Matrix
  console.log('\n--- 6. Security & Authorization Matrix ---');
  
  // Wrong Password
  const wrongPwdRes = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'shrutisanjanasahoo@gmail.com', password: 'WrongPassword@999' });
  assert('Wrong password returns 401', wrongPwdRes.status === 401);

  // Unknown Email
  const unknownEmailRes = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'nonexistentuser999@primeroute.com', password: 'Password@123' });
  assert('Unknown email returns 401', unknownEmailRes.status === 401);

  // Unauthenticated access to protected API
  const unauthRes = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/customer/dashboard',
    method: 'GET',
  });
  assert('Unauthenticated access returns 401', unauthRes.status === 401);

  // Customer attempting Warehouse Manager protected API
  const custOnWhApi = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/shipments/incoming',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${custToken}` }
  });
  assert('Customer accessing Warehouse API returns 403', custOnWhApi.status === 403);

  // Customer attempting Admin API
  const custOnAdminApi = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/dashboard/summary',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${custToken}` }
  });
  assert('Customer accessing Admin API returns 403', custOnAdminApi.status === 403);

  // Warehouse Manager attempting Admin API
  const whOnAdminApi = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/dashboard/summary',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${whToken}` }
  });
  assert('Warehouse Manager accessing Admin API returns 403', whOnAdminApi.status === 403);

  // Driver attempting Warehouse Manager API
  const driverOnWhApi = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/shipments/incoming',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${driverToken}` }
  });
  assert('Driver accessing Warehouse API returns 403', driverOnWhApi.status === 403);

  // Customer accessing Customer API
  const custValidApi = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/customer/dashboard',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${custToken}` }
  });
  assert('Customer accessing Customer API returns 200', custValidApi.status === 200);

  // Warehouse Manager accessing Warehouse API
  const whValidApi = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/shipments/incoming',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${whToken}` }
  });
  assert('Warehouse Manager accessing Warehouse API returns 200', whValidApi.status === 200);

  // Admin accessing Admin API
  const adminValidApi = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/dashboard/summary',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert('Admin accessing Admin API returns 200', adminValidApi.status === 200);

  // Driver accessing Driver API
  const driverValidApi = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/driver/dashboard',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${driverToken}` }
  });
  assert('Driver accessing Driver API returns 200', driverValidApi.status === 200);

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test script error:', err);
  process.exit(1);
});
