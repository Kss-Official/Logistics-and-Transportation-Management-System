const http = require('http');

function post(urlPath, data) {
  return new Promise((resolve) => {
    const body = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    };
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
  const loginRes = await post('/api/auth/login', {
    email: 'sanjanaaa.shru@gmail.com',
    password: 'Sanj@102026',
  });
  console.log('Login Status:', loginRes.status);
  const parsed = JSON.parse(loginRes.body);
  const token = parsed.token;
  console.log('Role:', parsed.role);

  const driversRes = await get('/api/admin/drivers/available', token);
  console.log('Available Drivers Status:', driversRes.status);
  console.log('Available Drivers Body:', JSON.parse(driversRes.body));
}

run();
