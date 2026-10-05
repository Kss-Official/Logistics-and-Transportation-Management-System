const http = require('http');

async function testGudiLogin() {
  const data = JSON.stringify({ email: 'gudisahoo@gmail.com', password: 'Gudi@450' });
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
  console.log('Login result for gudisahoo@gmail.com / Gudi@450:', res.status, res.body);
}

testGudiLogin().catch(console.error);
