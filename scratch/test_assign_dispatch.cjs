const http = require('http');

function post(path, token, data) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost', port: 8080, path, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }, res => {
      let b = ''; res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(b) }));
    });
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function run() {
  const login = await post('/api/auth/login', '', { email: 'priya@primeroute.com', password: 'Manager@2026!' });
  const token = login.data.token;

  console.log('1. Assigning driver 19 (Uttam) and vehicle 2 (VH-002) to shipment 27...');
  const assignRes = await post('/api/warehouse-manager/shipments/27/assign', token, {
    driverId: 19,
    vehicleId: 2
  });
  console.log('Assign result:', assignRes.status, assignRes.data);

  console.log('\n2. Authorizing and dispatching shipment 27...');
  const dispatchRes = await post('/api/warehouse-manager/shipments/27/dispatch', token, null);
  console.log('Dispatch result:', dispatchRes.status, dispatchRes.data);
}
run();
