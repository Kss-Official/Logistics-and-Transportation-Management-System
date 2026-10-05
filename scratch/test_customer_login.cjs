const http = require('http');

function testAuth(email, password) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ emailOrUsername: email, password });
    const req = http.request('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.write(data);
    req.end();
  });
}

async function run() {
  const passwords = [
    'Customer@2026!',
    'Password@123',
    'customer123',
    'password123',
    'Admin@2026!',
    'Gudi@123',
    'gudi123',
    '12345678',
    'password'
  ];

  for (const p of passwords) {
    const res = await testAuth('gudisahoo@gmail.com', p);
    if (res.status === 200) {
      console.log(`FOUND password for gudisahoo@gmail.com: ${p}`);
      return;
    }
  }
  for (const p of passwords) {
    const res = await testAuth('customer@primeroute.com', p);
    if (res.status === 200) {
      console.log(`FOUND password for customer@primeroute.com: ${p}`);
      return;
    }
  }
  console.log('No password matched standard list.');
}

run();
