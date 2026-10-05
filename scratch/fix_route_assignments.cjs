const http = require('http');

function post(path, data) {
  return new Promise((resolve) => {
    const body = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, body: b }));
    });
    req.write(body);
    req.end();
  });
}

function put(path, data, token) {
  return new Promise((resolve) => {
    const body = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Authorization': 'Bearer ' + token
      }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, body: b }));
    });
    req.write(body);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, body: b }));
    });
    req.end();
  });
}

async function run() {
  const loginRes = await post('/api/auth/login', {
    email: 'sanjanaaa.shru@gmail.com',
    password: 'Sanj@102026'
  });
  const token = JSON.parse(loginRes.body).token;

  const routesRes = await get('/api/admin/routes', token);
  const routes = JSON.parse(routesRes.body).data;

  for (const r of routes) {
    let updatePayload = {
      routeCode: r.routeCode,
      routeName: r.routeName,
      origin: r.origin,
      originName: r.originName,
      originCity: r.originCity,
      originState: r.originState,
      originAddress: r.originAddress,
      originLatitude: r.originLatitude,
      originLongitude: r.originLongitude,
      destination: r.destination,
      destinationName: r.destinationName,
      destinationCity: r.destinationCity,
      destinationState: r.destinationState,
      destinationAddress: r.destinationAddress,
      destinationLatitude: r.destinationLatitude,
      destinationLongitude: r.destinationLongitude,
      distanceKm: r.distanceKm,
      estimatedTransitTimeHours: r.estimatedTransitTimeHours,
      status: r.status,
      driverId: r.driverId,
      vehicleId: r.vehicleId
    };

    // Route 4: Chennai -> Bengaluru: Ramesh Kumar (20) & VH-001 (1)
    if (r.id === 4) {
      updatePayload.driverId = 20;
      updatePayload.vehicleId = 1;
      const res = await put('/api/admin/routes/4', updatePayload, token);
      console.log('Updated Route 4 (Chennai -> Bengaluru):', res.status);
    }
    // Route 2: Mumbai -> Kolkata: Priya Patel (13) & PR-VH-004 (8)
    else if (r.id === 2) {
      updatePayload.driverId = 13;
      updatePayload.vehicleId = 8;
      const res = await put('/api/admin/routes/2', updatePayload, token);
      console.log('Updated Route 2 (Mumbai -> Kolkata):', res.status);
    }
    // Route 5: Bhubaneswar -> Cuttack: Sneha Kulkarni (16) & PR-VH-005 (9)
    else if (r.id === 5) {
      updatePayload.driverId = 16;
      updatePayload.vehicleId = 9;
      const res = await put('/api/admin/routes/5', updatePayload, token);
      console.log('Updated Route 5 (Bhubaneswar -> Cuttack):', res.status);
    }
    // Route 3: Delhi NCR -> Jaipur: Anil Deshmukh (21) & KA-01-OVR-2890 (13)
    else if (r.id === 3) {
      updatePayload.driverId = 21;
      updatePayload.vehicleId = 13;
      const res = await put('/api/admin/routes/3', updatePayload, token);
      console.log('Updated Route 3 (Delhi NCR -> Jaipur):', res.status);
    }
    // Route 1: Bengaluru Central -> Koramangala: Standby Unassigned
    else if (r.id === 1) {
      updatePayload.driverId = null;
      updatePayload.vehicleId = null;
      const res = await put('/api/admin/routes/1', updatePayload, token);
      console.log('Updated Route 1 (Bengaluru -> Koramangala):', res.status);
    }
  }

  console.log('\n--- VERIFYING UPDATED ROUTES ---');
  const checkRoutes = await get('/api/admin/routes', token);
  JSON.parse(checkRoutes.body).data.forEach(r => {
    console.log({
      id: r.id,
      route: r.origin + ' -> ' + r.destination,
      driver: r.driverName + ' (ID: ' + r.driverId + ')',
      vehicle: r.vehicleNumber + ' (ID: ' + r.vehicleId + ')'
    });
  });
}

run();
