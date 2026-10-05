const http = require('http');

const testCases = [
  { email: 'gudisahoo@gmail.com', pass: 'Gudi@450' },
  { email: 'gudisahoo@gmail.com', pass: 'Password@123' },
  { email: 'admin@primeroute.com', pass: 'Password@123' },
  { email: 'admin@primeroute.com', pass: 'Admin@2026!' },
  { email: 'sanjanaaa.shru@gmail.com', pass: 'Password@123' },
  { email: 'shrutisanjanasahoo@gmail.com', pass: 'Password@123' },
  { email: 'customer@primeroute.com', pass: 'Password@123' },
  { email: 'customer@primeroute.com', pass: 'Customer@2026!' },
  { email: 'priya@primeroute.com', pass: 'Password@123' },
  { email: 'priya@primeroute.com', pass: 'Manager@2026!' },
  { email: 'ccu.east@primeroute.com', pass: 'Password@123' },
  { email: 'ccu.east@primeroute.com', pass: 'Manager@2026!' },
  { email: 'ramesh@primeroute.com', pass: 'Password@123' },
  { email: 'ramesh@primeroute.com', pass: 'Driver@2026!' }
];

async function check() {
  console.log('=== ACCOUNT CREDENTIALS AUDIT ===');
  for (const tc of testCases) {
    const data = JSON.stringify({ email: tc.email, password: tc.pass });
    const res = await new Promise((resolve) => {
      const req = http.request({
        hostname: 'localhost',
        port: 8080,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      }, (r) => {
        let b = '';
        r.on('data', c => b += c);
        r.on('end', () => resolve({ status: r.statusCode, body: b }));
      });
      req.write(data);
      req.end();
    });
    console.log(`${tc.email.padEnd(30)} | Password: ${tc.pass.padEnd(16)} | Status: ${res.status} | ${res.status === 200 ? 'SUCCESS' : 'INVALID'}`);
  }
}

check().catch(console.error);
