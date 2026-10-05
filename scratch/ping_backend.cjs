const http = require('http');

function ping() {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 8080,
        path: '/api/faqs',
        method: 'GET',
      },
      (res) => {
        let b = '';
        res.on('data', (c) => (b += c));
        res.on('end', () => resolve({ status: res.statusCode, body: b }));
      }
    );
    req.on('error', (err) => resolve({ error: err.message }));
    req.end();
  });
}

async function run() {
  for (let i = 0; i < 15; i++) {
    const r = await ping();
    if (r.status === 200) {
      console.log('Backend is UP and responding: 200 OK!');
      return;
    }
    console.log(`Attempt ${i + 1}: ${r.error || r.status}`);
    await new Promise((res) => setTimeout(res, 2000));
  }
  console.log('Backend did not start in time.');
}

run();
