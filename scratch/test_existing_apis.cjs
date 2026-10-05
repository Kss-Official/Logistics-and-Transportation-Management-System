const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function run() {
  console.log('--- Admin Login ---');
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@primeroute.com', password: 'Admin@PrimeRoute2026!' }
  );

  const token = loginRes.data.token;
  console.log('Admin login success. Token obtained.');
  console.log('User payload from login:', loginRes.data);

  console.log('--- Calling GET /api/customer/profile with Admin Token ---');
  const profileRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/customer/profile',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Profile response (status ' + profileRes.status + '):', profileRes.data);

  console.log('--- Calling GET /api/customer/support/contact ---');
  const contactRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/customer/support/contact',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Contact response (status ' + contactRes.status + '):', contactRes.data);
}

run().catch(console.error);
