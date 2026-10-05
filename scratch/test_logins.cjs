const http = require('http');

const usersToTest = [
  { email: 'admin@primeroute.com', pass: 'Admin@123' },
  { email: 'admin@primeroute.com', pass: 'Password@123' },
  { email: 'admin@primeroute.com', pass: 'admin123' },
  { email: 'sanjanaaa.shru@gmail.com', pass: 'Admin@123' },
  { email: 'sanjanaaa.shru@gmail.com', pass: 'Password@123' },
  { email: 'sanjanaaa.shru@gmail.com', pass: 'Sanjana@123' },
  { email: 'gudisahoo@gmail.com', pass: 'Password@123' },
  { email: 'customer@primeroute.com', pass: 'Password@123' },
  { email: 'customer@primeroute.com', pass: 'Customer@123' },
  { email: 'shrutisanjanasahoo@gmail.com', pass: 'Password@123' },
  { email: 'shrutisanjanasahoo@gmail.com', pass: 'Shruti@123' }
];

async function testAll() {
  for (const u of usersToTest) {
    const data = JSON.stringify({ email: u.email, password: u.pass });
    const res = await new Promise((resolve) => {
      const req = http.request({
        hostname: 'localhost',
        port: 8080,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
      }, (r) => {
        let b = '';
        r.on('data', c => b += c);
        r.on('end', () => resolve({ status: r.statusCode, body: b }));
      });
      req.write(data);
      req.end();
    });
    console.log(u.email, u.pass, '->', res.status, res.status === 200 ? 'SUCCESS' : res.body);
  }
}

testAll().catch(console.error);
