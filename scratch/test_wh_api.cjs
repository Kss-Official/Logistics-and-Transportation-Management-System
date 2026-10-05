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
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch (e) {
          resolve({ status: res.statusCode, body: raw });
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
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch (e) {
          resolve({ status: res.statusCode, body: raw });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function test() {
  try {
    console.log('Logging in as Priya Sharma (priya@primeroute.com)...');
    // Priya password in DataInitializer is Manager@2026!
    let loginRes = await post('/api/auth/login', { email: 'priya@primeroute.com', password: 'Manager@2026!' });
    if (!loginRes.body.token && !loginRes.body.data?.token) {
      console.log('Login failed with Manager@2026!, trying Priya@2026!...', loginRes.body);
      loginRes = await post('/api/auth/login', { email: 'priya@primeroute.com', password: 'Priya@2026!' });
    }
    const token = loginRes.body.token || loginRes.body.data?.token;
    console.log('Login result token present:', !!token);

    if (!token) {
      console.error('Could not obtain token:', loginRes.body);
      return;
    }

    console.log('\n--- 1. Warehouse Details ---');
    const whRes = await get('/api/warehouse-manager/warehouse', token);
    console.log('Warehouse:', whRes.body.data);

    console.log('\n--- 2. Available Drivers ---');
    const drvRes = await get('/api/warehouse-manager/drivers/available', token);
    console.log('Available Drivers count:', drvRes.body.data ? drvRes.body.data.length : 'N/A', JSON.stringify(drvRes.body.data, null, 2));

    console.log('\n--- 3. Available Vehicles ---');
    const vehRes = await get('/api/warehouse-manager/vehicles/available', token);
    console.log('Available Vehicles count:', vehRes.body.data ? vehRes.body.data.length : 'N/A', JSON.stringify(vehRes.body.data, null, 2));

    console.log('\n--- 4. Incoming Shipments ---');
    const incRes = await get('/api/warehouse-manager/shipments/incoming', token);
    console.log('Incoming Shipments count:', incRes.body.data ? incRes.body.data.length : 'N/A');
    if (incRes.body.data) {
      incRes.body.data.forEach(s => {
        console.log(`  - ID: ${s.id}, Tracking: ${s.trackingNumber}, Order: ${s.orderNumber}, Origin: ${s.originWarehouseCode} (${s.originCity}), Dest: ${s.destinationWarehouseCode} (${s.destinationCity}), Stage: ${s.operationalStage}, Status: ${s.status}`);
      });
    }

    console.log('\n--- 5. Outgoing Shipments ---');
    const outRes = await get('/api/warehouse-manager/shipments/outgoing', token);
    console.log('Outgoing Shipments count:', outRes.body.data ? outRes.body.data.length : 'N/A');
    if (outRes.body.data) {
      outRes.body.data.forEach(s => {
        console.log(`  - ID: ${s.id}, Tracking: ${s.trackingNumber}, Order: ${s.orderNumber}, Origin: ${s.originWarehouseCode} (${s.originCity}), Dest: ${s.destinationWarehouseCode} (${s.destinationCity}), Stage: ${s.operationalStage}, Status: ${s.status}`);
      });
    }

  } catch (err) {
    console.error('Test error:', err);
  }
}

test();
