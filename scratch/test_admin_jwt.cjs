const http = require('http');

function post(urlPath, data, token) {
  return new Promise((resolve) => {
    const body = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 8080,
        path: urlPath,
        method: 'POST',
        headers,
      },
      (res) => {
        let b = '';
        res.on('data', (c) => (b += c));
        res.on('end', () => resolve({ status: res.statusCode, body: b }));
      }
    );
    req.on('error', (err) => resolve({ error: err.message }));
    req.write(body);
    req.end();
  });
}

function get(urlPath, token) {
  return new Promise((resolve) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 8080,
        path: urlPath,
        method: 'GET',
        headers,
      },
      (res) => {
        let b = '';
        res.on('data', (c) => (b += c));
        res.on('end', () => resolve({ status: res.statusCode, body: b }));
      }
    );
    req.on('error', (err) => resolve({ error: err.message }));
    req.end();
  });
}

async function run() {
  console.log('--- 1. Authenticate Admin ---');
  const loginRes = await post('/api/auth/login', {
    email: 'admin@primeroute.com',
    password: 'Admin@PrimeRoute2026!',
  });
  console.log('Login Status:', loginRes.status);
  const parsed = JSON.parse(loginRes.body);
  const token = parsed.token;
  console.log('Login Role:', parsed.role);
  console.log('Token exists:', !!token);

  console.log('\n--- 2. Access Admin Dashboard Summary with Token ---');
  const dashRes = await get('/api/admin/dashboard/summary', token);
  console.log('Dashboard status:', dashRes.status);
  console.log('Dashboard body preview:', dashRes.body.substring(0, 150));

  console.log('\n--- 3. Access Admin Orders with Token ---');
  const ordersRes = await get('/api/admin/orders', token);
  console.log('Admin Orders status:', ordersRes.status);
  console.log('Admin Orders count:', JSON.parse(ordersRes.body).length);
}

run();
