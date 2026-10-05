const http = require('http');

const candidates = [
  'Customer@123',
  'customer123',
  'password123',
  'password',
  'Shruti@123',
  '123456',
  'admin123'
];

async function checkOne(pwd) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ email: 'shrutisanjanasahoo@gmail.com', password: pwd });
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
          if (res.statusCode === 200) {
            console.log(`FOUND: ${pwd}`);
          }
          resolve(res.statusCode);
        });
      }
    );
    req.write(data);
    req.end();
  });
}

async function run() {
  for (const p of candidates) {
    const s = await checkOne(p);
    if (s === 200) break;
  }
}

run();
