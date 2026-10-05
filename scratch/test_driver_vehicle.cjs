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

async function run() {
  console.log('Logging in as ramesh@primeroute.com...');
  const loginRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'ramesh@primeroute.com', password: 'Driver@2026!' });

  const token = loginRes.data?.data?.token || loginRes.data?.token;

  console.log('\nTesting GET /api/driver/me ...');
  const meRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/driver/me',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('GET /api/driver/me status:', meRes.status);
  console.log('GET /api/driver/me body:', JSON.stringify(meRes.data, null, 2));
}

run().catch(console.error);
