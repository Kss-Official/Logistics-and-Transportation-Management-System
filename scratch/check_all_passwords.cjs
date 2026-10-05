const { execSync } = require('child_process');

// We can check through backend or write a small script that inspects UserRepository or run a Spring Boot runner or query.
// Let's create a script in scratch to test BCrypt matching of all common passwords against every user in the DB.

const http = require('http');

function apiRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: json });
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

const testCandidates = [
  'Driver@2026!',
  'Manager@2026!',
  'Customer@2026!',
  'Admin@2026!',
  'Password@123',
  'password123',
  'PrimeRoute@2026!',
  'Priya@2026!',
  'Priya@123',
  'Shruti@2026!',
  'Shruti@123',
];

async function check(email) {
  console.log(`\n================ Testing ${email} ================`);
  for (const pwd of testCandidates) {
    const res = await apiRequest(
      {
        hostname: 'localhost',
        port: 8080,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email, password: pwd }
    );
    if (res.status === 200) {
      console.log(`>>> MATCH FOUND: Password is "${pwd}"!`);
      console.log('Response:', res.data);
      return pwd;
    }
  }
  console.log(`>>> NO MATCH among candidates for ${email}`);
  return null;
}

async function run() {
  await check('shrutisanjanasahoo@gmail.com');
  await check('priya@primeroute.com');
  await check('admin@primeroute.com');
  await check('ramesh@primeroute.com');
  await check('customer2@primeroute.com');
}

run();
