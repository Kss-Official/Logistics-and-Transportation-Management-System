const http = require('http');
const data = JSON.stringify({ email: 'customer@primeroute.com', password: 'Customer@123' });
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
    let b = '';
    res.on('data', (c) => (b += c));
    res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', b));
  }
);
req.write(data);
req.end();
