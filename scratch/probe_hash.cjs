const http = require('http');

async function testRegister() {
  const regData = JSON.stringify({
    fullName: 'Gudi Sahoo',
    email: 'temp_hash_probe@primeroute.com',
    password: 'Gudi@450',
    phone: '9876543219',
    role: 'CUSTOMER'
  });

  const res = await new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(regData)
      }
    }, (r) => {
      let b = '';
      r.on('data', c => b += c);
      r.on('end', () => resolve({ status: r.statusCode, body: b }));
    });
    req.write(regData);
    req.end();
  });

  console.log('Register Response:', res.status, res.body);
}

testRegister().catch(console.error);
