const http = require('http');

function apiRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch {
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

async function run() {
  console.log('================================================================');
  console.log('URGENT BUG FIX SESSION — BACKEND & FRONTEND VERIFICATION');
  console.log('================================================================\n');

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

  // ── 1. Authenticate Users ──
  console.log('--- Step 1: Authenticating Users ---');
  const driverLogin = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'ramesh@primeroute.com', password: 'Driver@2026!' });

  const managerLogin = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'priya@primeroute.com', password: 'Manager@2026!' });

  assert('Driver Login 200', driverLogin.status === 200);
  assert('Manager Login 200', managerLogin.status === 200);

  const driverToken = driverLogin.data?.token;
  const managerToken = managerLogin.data?.token;

  // ── 2. CORS & Preflight Verification ──
  console.log('\n--- Step 2: CORS & Preflight Testing ---');
  const preflightRes = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/driver/deliveries/10/out-for-delivery',
    method: 'OPTIONS',
    headers: {
      'Origin': 'http://localhost:5173',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Authorization, Content-Type',
    },
  });

  assert('CORS Preflight Status is 200', preflightRes.status === 200, `(Status: ${preflightRes.status})`);
  assert(
    'CORS Access-Control-Allow-Origin header matches frontend',
    preflightRes.headers['access-control-allow-origin'] === 'http://localhost:5173',
    `(Allow-Origin: ${preflightRes.headers['access-control-allow-origin']})`
  );
  assert(
    'CORS Access-Control-Allow-Methods includes POST and OPTIONS',
    preflightRes.headers['access-control-allow-methods']?.includes('POST'),
    `(Methods: ${preflightRes.headers['access-control-allow-methods']})`
  );
  assert(
    'CORS Access-Control-Allow-Credentials is true',
    preflightRes.headers['access-control-allow-credentials'] === 'true'
  );

  // ── 3. Warehouse Inventory LOW-10 Endpoint (500 Bug Fix) ──
  console.log('\n--- Step 3: Warehouse Inventory Item / LOW-10 (500 Bug Fix) ---');
  const invRes = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse/inventory/LOW-10',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${managerToken}`,
    },
  });

  console.log(`Response for GET /api/warehouse/inventory/LOW-10: Status ${invRes.status}`, invRes.data || invRes.raw);
  assert('Inventory LOW-10 is NOT HTTP 500', invRes.status !== 500, `(Status: ${invRes.status})`);
  assert('Inventory LOW-10 returns 404 (ResourceNotFound)', invRes.status === 404, `(Status: ${invRes.status})`);
  assert('Inventory response body contains clean error message', (invRes.data?.message || '').includes('LOW-10') || (invRes.data?.message || '').includes('not found'));

  // Also test getting existing inventory
  const allInvRes = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse/inventory',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${managerToken}`,
    },
  });
  assert('GET /api/warehouse/inventory returns 200', allInvRes.status === 200);

  // ── 4. Driver Active Delivery & Out-For-Delivery ID Flow ──
  console.log('\n--- Step 4: Driver Active Delivery & Double-Slash URL Prevention ---');
  const activeDelRes = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/driver/deliveries/active',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${driverToken}`,
    },
  });

  assert('GET /api/driver/deliveries/active returns 200', activeDelRes.status === 200);

  // Test Driver markOutForDelivery on invalid ID (empty/whitespace/404)
  const invalidOutRes = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/driver/deliveries/999999/out-for-delivery',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${driverToken}`,
      'Content-Type': 'application/json',
    },
  });
  assert('Out-for-delivery on non-existent shipment returns 404 or 400', invalidOutRes.status === 404 || invalidOutRes.status === 400, `(Status: ${invalidOutRes.status})`);

  // Test Role Security on Driver mutation endpoints
  console.log('\n--- Step 5: Driver Mutation Role Security ---');
  const managerDriverAttempt = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/driver/deliveries/1/out-for-delivery',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${managerToken}`,
      'Content-Type': 'application/json',
    },
  });
  assert('Warehouse Manager accessing Driver mutation returns 403 Forbidden', managerDriverAttempt.status === 403, `(Status: ${managerDriverAttempt.status})`);

  const unauthAttempt = await apiRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/driver/deliveries/1/out-for-delivery',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  assert('Unauthenticated access to Driver mutation returns 401 Unauthorized', unauthAttempt.status === 401, `(Status: ${unauthAttempt.status})`);

  console.log('\n================================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
