const http = require('http');

function post(path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw) });
        } catch (e) {
          resolve({ status: res.statusCode, data: raw });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw) });
        } catch (e) {
          resolve({ status: res.statusCode, data: raw });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  const loginRes = await post('/api/auth/login', { email: 'priya@primeroute.com', password: 'Manager@2026!' });
  const token = loginRes.data?.token || loginRes.data?.data?.token;

  const drivers = (await get('/api/warehouse-manager/drivers/available', token)).data?.data;
  const vehicles = (await get('/api/warehouse-manager/vehicles/available', token)).data?.data;
  console.log('Available Drivers:', drivers.map(d => ({ id: d.id, name: d.fullName, vehId: d.vehicleId })));
  console.log('Available Vehicles:', vehicles.map(v => ({ id: v.id, num: v.vehicleNumber, driverId: v.assignedDriver?.id })));

  const matchedDriver = drivers.find(d => d.vehicleId) || drivers[0];
  const matchedVeh = vehicles.find(v => v.id === matchedDriver.vehicleId) || vehicles[0];

  console.log(`Assigning Driver ${matchedDriver.id} with Vehicle ${matchedVeh.id}...`);
  const assignRes = await post('/api/warehouse-manager/shipments/1/assign-fleet', {
    driverId: matchedDriver.id,
    vehicleId: matchedVeh.id
  }, { 'Authorization': `Bearer ${token}` });
  console.log('Assign result:', assignRes);

  console.log('Dispatching...');
  const dispRes = await post('/api/warehouse-manager/shipments/1/dispatch', {}, { 'Authorization': `Bearer ${token}` });
  console.log('Dispatch result:', dispRes);

  const dash = (await get('/api/warehouse-manager/dashboard', token)).data?.data;
  console.log('\nFinal Dashboard:');
  console.log(`- Ready to Process:    ${dash.readyToProcessCount}`);
  console.log(`- Picking in Progress: ${dash.pickingCount}`);
  console.log(`- Packed Consignments: ${dash.packedCount}`);
  console.log(`- Ready for Dispatch:  ${dash.readyForDispatchCount}`);
  console.log(`- Outgoing Total:      ${dash.outgoingShipmentsCount}`);
}

run().catch(console.error);
