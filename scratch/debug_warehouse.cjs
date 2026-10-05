const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function debugErrors() {
  const login = await request({
    hostname: 'localhost', port: 8080, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'priya@primeroute.com', password: 'Manager@2026!' });
  const token = login.data?.token || login.data?.data?.token;
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  console.log('Testing GET transactions...');
  const txRes = await request({
    hostname: 'localhost', port: 8080, path: '/api/warehouse-manager/inventory/transactions?sku=SKU-ELEC-001', method: 'GET', headers
  });
  console.log('Transactions res:', txRes);

  console.log('Testing drivers list...');
  const drvRes = await request({ hostname: 'localhost', port: 8080, path: '/api/warehouse-manager/drivers', method: 'GET', headers });
  console.log('Drivers:', drvRes.data?.data?.length, drvRes.data?.data?.[0]);

  console.log('Testing vehicles list...');
  const vehRes = await request({ hostname: 'localhost', port: 8080, path: '/api/warehouse-manager/vehicles', method: 'GET', headers });
  console.log('Vehicles:', vehRes.data?.data?.length, vehRes.data?.data?.[0]);

  const outRes = await request({ hostname: 'localhost', port: 8080, path: '/api/warehouse-manager/shipments/outgoing', method: 'GET', headers });
  const shipment = outRes.data?.data?.[0];
  console.log('Target Shipment:', shipment?.id, shipment?.trackingNumber);

  if (shipment && drvRes.data?.data?.[0] && vehRes.data?.data?.[0]) {
    const assignRes = await request({
      hostname: 'localhost', port: 8080, path: `/api/warehouse-manager/shipments/${shipment.id}/assign`, method: 'POST', headers
    }, {
      driverId: drvRes.data.data[0].id,
      vehicleId: vehRes.data.data[0].id
    });
    console.log('Assign Res:', assignRes);
  }
}

debugErrors();
