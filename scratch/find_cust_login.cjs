const http = require('http');

const candidates = [
  'Customer@2026!',
  'Customer@123',
  'Password@123',
  'password123',
  'password',
  'Shruti@123',
  'Shruti@2026!',
  'PrimeRoute@2026!',
  '123456',
  'Driver@2026!',
  'Manager@2026!'
];

const customerEmails = [
  'shrutisanjanasahoo@gmail.com',
  'customer@primeroute.com',
  'demo_customer@primeroute.com',
  'testuser@primeroute.com'
];

function check(email, pwd) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ email, password: pwd });
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
            console.log(`>>> SUCCESS! [${email}] password is: "${pwd}"`);
            resolve(true);
          } else {
            resolve(false);
          }
        });
      }
    );
    req.on('error', () => resolve(false));
    req.write(data);
    req.end();
  });
}

async function run() {
  for (const u of customerEmails) {
    console.log(`Testing customer ${u}...`);
    for (const p of candidates) {
      const ok = await check(u, p);
      if (ok) break;
    }
  }
}

run();
