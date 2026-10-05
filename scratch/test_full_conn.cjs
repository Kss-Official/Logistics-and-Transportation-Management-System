const http = require('http');

function testFetch(host, port, path) {
  return new Promise((resolve) => {
    const req = http.request({ host, port, path, method: 'GET', timeout: 3000 }, (res) => {
      resolve({ host, port, path, status: res.statusCode });
    });
    req.on('error', (err) => resolve({ host, port, path, error: err.message }));
    req.end();
  });
}

async function run() {
  console.log('Backend localhost:8080 ->', await testFetch('localhost', 8080, '/api/faqs'));
  console.log('Backend 127.0.0.1:8080 ->', await testFetch('127.0.0.1', 8080, '/api/faqs'));
  console.log('Frontend localhost:5173 ->', await testFetch('localhost', 5173, '/'));
  console.log('Frontend 127.0.0.1:5173 ->', await testFetch('127.0.0.1', 5173, '/'));
}

run();
