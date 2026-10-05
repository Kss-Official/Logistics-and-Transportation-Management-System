const http = require('http');

function request(method, urlPath, data, token) {
  return new Promise((resolve) => {
    const body = data ? JSON.stringify(data) : '';
    const headers = { 'Content-Type': 'application/json' };
    if (body) headers['Content-Length'] = Buffer.byteLength(body);
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      { hostname: 'localhost', port: 8080, path: urlPath, method: method, headers },
      (res) => {
        let b = '';
        res.on('data', (c) => (b += c));
        res.on('end', () => {
          let parsed = null;
          try { parsed = JSON.parse(b); } catch (e) { parsed = b; }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.on('error', (err) => resolve({ error: err.message }));
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  const loginRes = await request('POST', '/api/auth/login', {
    email: 'sanjanaaa.shru@gmail.com',
    password: 'Sanjana@102026',
  });
  const token = loginRes.body.token;

  // Unassigned orders
  const unassignedRes = await request('GET', '/api/admin/shipments/unassigned-orders', null, token);
  console.log('Unassigned orders available:', unassignedRes.body.data?.length);
  if (unassignedRes.body.data && unassignedRes.body.data.length > 0) {
    const orderId = unassignedRes.body.data[0].id;
    console.log(`Testing createShipment for order ID ${orderId} with PR-VH-005 (vehicle 9) and Ramesh (driver 18)...`);
    const createMismatch = await request('POST', '/api/admin/shipments', {
      orderId: orderId,
      initialLocation: 'Mumbai Central Hub',
      vehicleId: 9,
      driverId: 18
    }, token);
    console.log('Status Code:', createMismatch.status);
    console.log('Response Message:', createMismatch.body.message);
  }
}

main().catch(console.error);
