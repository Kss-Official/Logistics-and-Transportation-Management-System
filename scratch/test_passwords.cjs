const http = require('http');

const candidates = [
  'Admin@PrimeRoute2026!',
  'Admin@PrimeRouteTemp2026!',
  'AdminPassword123!',
  'Admin@123',
  'admin123',
  'password',
  'password123',
  'Admin@2026',
  'Customer@123'
];

async function checkOne(pwd) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ email: 'admin@primeroute.com', password: pwd });
    const req = http.request(
      {
        hostname: 'localhost',
        port: 8080,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          console.log(`[${res.statusCode}] ${pwd} -> ${body}`);
          resolve();
        });
      }
    );
    req.write(data);
    req.end();
  });
}

async function run() {
  for (const p of candidates) {
    await checkOne(p);
  }
}

run();
