const http = require('http');

function post(urlPath, data) {
  return new Promise((resolve) => {
    const body = JSON.stringify(data);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 8080,
        path: urlPath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
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
    const req = http.request(
      {
        hostname: 'localhost',
        port: 8080,
        path: urlPath,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
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
  console.log('--- Login Customer 4 (shrutisanjanasahoo@gmail.com) ---');
  // Let's check if we can login as customer@primeroute.com or customer 4
  const c4Login = await post('/api/auth/login', {
    email: 'customer@primeroute.com',
    password: 'Customer@123',
  });
  console.log('Customer Login Status:', c4Login.status);
  const c4Token = JSON.parse(c4Login.body).token;

  console.log('--- GET /api/customer/dashboard for customer@primeroute.com ---');
  const dashRes = await get('/api/customer/dashboard', c4Token);
  console.log(dashRes.body);

  console.log('--- GET /api/customer/orders for customer@primeroute.com ---');
  const ordRes = await get('/api/customer/orders', c4Token);
  console.log(ordRes.body);

  console.log('--- GET /api/customer/shipments for customer@primeroute.com ---');
  const shipRes = await get('/api/customer/shipments', c4Token);
  console.log(shipRes.body);
}

run();
