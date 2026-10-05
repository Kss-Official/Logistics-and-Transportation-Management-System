const http = require('http');

async function run() {
  const loginBody = JSON.stringify({
    email: 'ramesh@primeroute.com',
    password: 'Driver@2026!'
  });

  const loginRes = await new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginBody)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.write(loginBody);
    req.end();
  });

  console.log('Login Body:', JSON.stringify(loginRes.body));
  const token = loginRes.body?.token || loginRes.body?.data?.token || loginRes.body?.accessToken;

  const endpoints = [
    '/api/driver/me',
    '/api/driver/dashboard',
    '/api/driver/deliveries',
    '/api/driver/deliveries/active',
    '/api/driver/deliveries/active/route',
    '/api/driver/vehicle',
    '/api/driver/notifications'
  ];

  for (const ep of endpoints) {
    const epRes = await new Promise((resolve) => {
      const req = http.request({
        hostname: 'localhost',
        port: 8080,
        path: ep,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          let parsed;
          try { parsed = JSON.parse(data); } catch { parsed = data; }
          resolve({ status: res.statusCode, body: parsed });
        });
      });
      req.end();
    });

    console.log(`Endpoint ${ep} -> Status ${epRes.status}, data:`, typeof epRes.body === 'object' ? Object.keys(epRes.body) : epRes.body);
  }
}

run();
