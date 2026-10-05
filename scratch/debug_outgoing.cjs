const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body });
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function debug() {
  const loginRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'priya@primeroute.com', password: 'Manager@2026!' });

  const token = JSON.parse(loginRes.body).token;
  const outgoingRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse/outgoing',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Outgoing response:', outgoingRes);
}

debug().catch(console.error);
