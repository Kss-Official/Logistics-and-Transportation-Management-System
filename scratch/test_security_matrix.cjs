const http = require('http');

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
  console.log('=== AUTHENTICATING ROLES ===');
  const driver1Token = await login('ramesh@primeroute.com', 'Driver@2026!');
  const driver2Token = await login('priya.patel@primeroute.in', 'Driver@2026!');
  const adminToken = await login('admin@primeroute.com', 'Manager@2026!') || await login('sanjanaaa.shru@gmail.com', 'Manager@2026!');
  const customerToken = await login('customer@primeroute.com', 'Customer@2026!') || await login('customer@primeroute.com', 'Manager@2026!') || await login('shrutisanjanasahoo@gmail.com', 'Manager@2026!');

  console.log('Driver 1 (Ramesh):', driver1Token ? '✓ Auth Success' : '✗ Auth Failed');
  console.log('Driver 2 (Priya):', driver2Token ? '✓ Auth Success' : '✗ Auth Failed');
  console.log('Admin:', adminToken ? '✓ Auth Success' : '✗ Auth Failed');
  console.log('Customer:', customerToken ? '✓ Auth Success' : '✗ Auth Failed');

  // Let's create or check a shipment assigned to Driver 1 to test own vs other driver completion
  // Or check active deliveries for Driver 1
  const d1Res = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/driver/deliveries',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${driver1Token}` }
  });
  console.log('Driver 1 Deliveries Response:', d1Res.status, Array.isArray(d1Res.data?.data) ? d1Res.data.data.length : d1Res.data);

  // We can test the security matrix endpoints directly:
  // POST /api/driver/deliveries/{id}/complete
  // POST /api/driver/deliveries/{id}/start-trip
  // POST /api/driver/deliveries/{id}/out-for-delivery
  // POST /api/driver/deliveries/{id}/status
  // POST /api/driver/deliveries/{id}/proof-of-delivery

  console.log('\n==================================================');
  console.log('SECURITY MATRIX VERIFICATION');
  console.log('==================================================');

  const testDeliveryId = 99999; // dummy ID or existing ID

  // 1. Admin -> Driver mutation endpoint
  console.log('\n[TEST 3] Admin calling Driver completion endpoint POST /api/driver/deliveries/1/complete');
  const adminAttempt = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/driver/deliveries/1/complete',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    }
  }, { recipientName: 'Admin Attempt', signatureData: 'data:image/png;base64,123' });
  console.log(`Status: ${adminAttempt.status} (Expected: 403 Forbidden)`);
  console.log(`Response Body:`, adminAttempt.data);

  // 4. Customer -> Driver mutation endpoint
  console.log('\n[TEST 4] Customer calling Driver completion endpoint POST /api/driver/deliveries/1/complete');
  const customerAttempt = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/driver/deliveries/1/complete',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${customerToken}`,
      'Content-Type': 'application/json'
    }
  }, { recipientName: 'Customer Attempt', signatureData: 'data:image/png;base64,123' });
  console.log(`Status: ${customerAttempt.status} (Expected: 403 Forbidden)`);
  console.log(`Response Body:`, customerAttempt.data);

  // 5. Unauthenticated -> Driver mutation endpoint
  console.log('\n[TEST 5] Unauthenticated calling Driver completion endpoint POST /api/driver/deliveries/1/complete');
  const unauthAttempt = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/driver/deliveries/1/complete',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }, { recipientName: 'Anon Attempt', signatureData: 'data:image/png;base64,123' });
  console.log(`Status: ${unauthAttempt.status} (Expected: 401 Unauthorized / Forbidden)`);
  console.log(`Response Body:`, unauthAttempt.data);

  // Other driver operational endpoints testing for Admin
  console.log('\n[TEST 3b] Admin calling POST /api/driver/deliveries/1/start-trip');
  const adminStart = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/driver/deliveries/1/start-trip',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' }
  }, {});
  console.log(`Status: ${adminStart.status} (Expected: 403 Forbidden)`);

  console.log('\n[TEST 3c] Admin calling POST /api/driver/deliveries/1/out-for-delivery');
  const adminOut = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/driver/deliveries/1/out-for-delivery',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' }
  }, {});
  console.log(`Status: ${adminOut.status} (Expected: 403 Forbidden)`);

  console.log('\n[TEST 3d] Admin calling POST /api/driver/deliveries/1/proof-of-delivery');
  const adminPod = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/driver/deliveries/1/proof-of-delivery',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' }
  }, {});
  console.log(`Status: ${adminPod.status} (Expected: 403 Forbidden)`);
}

run().catch(console.error);
