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

async function run() {
  const res = await post('/api/auth/login', {
    email: 'shrutisanjanasahoo@gmail.com',
    password: 'Shruti@123'
  });
  console.log('Login attempt with Shruti@123:', res.status, res.body);
}

run();
