const http = require('http');

function testFetch(host, port) {
  return new Promise((resolve) => {
    const req = http.request({ host, port, path: '/', method: 'GET', timeout: 3000 }, (res) => {
      resolve({ host, port, status: res.statusCode });
    });
    req.on('error', (err) => resolve({ host, port, error: err.message }));
    req.end();
  });
}

async function run() {
  console.log('Test localhost:5173 ->', await testFetch('localhost', 5173));
  console.log('Test 127.0.0.1:5173 ->', await testFetch('127.0.0.1', 5173));
  console.log('Test [::1]:5173 ->', await testFetch('::1', 5173));
}

run();
