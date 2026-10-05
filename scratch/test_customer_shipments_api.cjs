const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(raw || '{}') }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'GET',
      headers
    }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw || '{}') });
        } catch(e) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function test() {
  const loginRes = await post('/api/auth/login', {
    email: 'gudisahoo@gmail.com',
    password: 'Gudi@450'
  });
  console.log('Login status:', loginRes.status);
  console.log('Login body:', loginRes.data);
  const token = loginRes.data?.token || loginRes.data?.data?.token;

  // 1. Get all shipments for customer
  const resAll = await get('/api/customer/shipments', token);
  console.log('GET /api/customer/shipments status:', resAll.status);
  console.log('GET /api/customer/shipments body:', resAll.data);

  // 2. Get shipment 751
  const res751 = await get('/api/customer/shipments/751', token);
  console.log('GET /api/customer/shipments/751 status:', res751.status);
  console.log('GET /api/customer/shipments/751 body:', JSON.stringify(res751.data, null, 2));
}

test().catch(console.error);
