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

async function testDriver(email, password) {
  console.log(`\n=== Testing Driver: ${email} ===`);
  const loginRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email, password });

  if (loginRes.status !== 200) {
    console.log(`Login failed for ${email}:`, loginRes.data);
    return;
  }
  const token = loginRes.data?.data?.token || loginRes.data?.token;

  const vehRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/driver/vehicle',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  console.log('Vehicle response:', vehRes.status, vehRes.data);
}

async function run() {
  await testDriver('ramesh@primeroute.com', 'Driver@2026!');
  await testDriver('priya.patel@primeroute.in', 'Driver@2026!');
}

run().catch(console.error);
