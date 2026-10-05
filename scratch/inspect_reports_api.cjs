const http = require('http');

function post(urlPath, data) {
  return new Promise((resolve) => {
    const body = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    };
    const req = http.request(
      {
        hostname: 'localhost',
        port: 8080,
        path: urlPath,
        method: 'POST',
        headers,
      },
      (res) => {
        let b = '';
        res.on('data', (c) => (b += c));
        res.on('end', () => resolve({ status: res.statusCode, body: b }));
      }
    );
    req.on('error', (err) => resolve({ error: err.message }));
    req.write(body);
    req.end();
  });
}

function get(urlPath, token) {
  return new Promise((resolve) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 8080,
        path: urlPath,
        method: 'GET',
        headers,
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
  const loginRes = await post('/api/auth/login', {
    email: 'sanjanaaa.shru@gmail.com',
    password: 'Sanj@102026',
  });
  console.log('Login Status:', loginRes.status);
  const parsed = JSON.parse(loginRes.body);
  const token = parsed.data?.accessToken || parsed.data?.token || parsed.token;
  console.log('Token exists:', !!token);

  if (!token) return;

  const repRes = await get('/api/admin/reports/dashboard?range=LAST_30_DAYS', token);
  console.log('Reports Dashboard Status:', repRes.status);
  try {
    const rep = JSON.parse(repRes.body);
    console.log('--- OVERVIEW ---');
    console.log(JSON.stringify(rep.data?.overview, null, 2));

    console.log('--- FLEET ---');
    console.log(JSON.stringify({
      totalVehicles: rep.data?.fleet?.totalVehicles,
      activeVehicles: rep.data?.fleet?.activeVehicles,
      availableVehicles: rep.data?.fleet?.availableVehicles,
      assignedVehicles: rep.data?.fleet?.assignedVehicles,
      maintenanceVehicles: rep.data?.fleet?.maintenanceVehicles,
      utilizationRate: rep.data?.fleet?.utilizationRate,
      rosterCount: rep.data?.fleet?.vehicleRoster?.length,
      rosterSample: rep.data?.fleet?.vehicleRoster?.slice(0, 5)
    }, null, 2));

    console.log('--- DRIVERS ---');
    console.log(JSON.stringify({
      totalDrivers: rep.data?.drivers?.totalDrivers,
      activeDrivers: rep.data?.drivers?.activeDrivers,
      assignedDrivers: rep.data?.drivers?.assignedDrivers,
      availableDrivers: rep.data?.drivers?.availableDrivers,
      driverCount: rep.data?.drivers?.drivers?.length,
      driversSample: rep.data?.drivers?.drivers?.slice(0, 5)
    }, null, 2));

    console.log('--- ROUTES ---');
    console.log(JSON.stringify({
      totalRoutes: rep.data?.routes?.totalRoutes,
      activeRoutes: rep.data?.routes?.activeRoutes,
      inactiveRoutes: rep.data?.routes?.inactiveRoutes,
      routesCount: rep.data?.routes?.routes?.length,
      routesSample: rep.data?.routes?.routes?.slice(0, 3)
    }, null, 2));

    console.log('--- WAREHOUSES ---');
    console.log(JSON.stringify({
      totalWarehouses: rep.data?.warehouses?.totalWarehouses,
      activeWarehouses: rep.data?.warehouses?.activeWarehouses,
      totalCapacity: rep.data?.warehouses?.totalCapacity,
      occupiedCapacity: rep.data?.warehouses?.occupiedCapacity,
      overallUtilizationRate: rep.data?.warehouses?.overallUtilizationRate,
      warehousesCount: rep.data?.warehouses?.warehouses?.length,
      warehousesSample: rep.data?.warehouses?.warehouses?.slice(0, 3)
    }, null, 2));

    // Also fetch direct vehicles & drivers lists to compare
    const vehRes = await get('/api/vehicles', token);
    const drvRes = await get('/api/drivers', token);
    const whRes = await get('/api/warehouses', token);
    const routRes = await get('/api/routes', token);

    const vehData = JSON.parse(vehRes.body).data || [];
    const drvData = JSON.parse(drvRes.body).data || [];
    const whData = JSON.parse(whRes.body).data || [];
    const routData = JSON.parse(routRes.body).data || [];

    console.log('--- DIRECT API COUNTS ---');
    console.log('Direct Vehicles count:', vehData.length);
    console.log('Vehicles statuses:', vehData.map(v => ({ id: v.id, plate: v.licensePlate, status: v.status, driverId: v.driverId, driverName: v.driverName, routeId: v.routeId })));
    console.log('Direct Drivers count:', drvData.length);
    console.log('Drivers statuses:', drvData.map(d => ({ id: d.id, name: d.name, status: d.status, vehicleId: d.vehicleId, vehiclePlate: d.vehiclePlate })));
    console.log('Direct Warehouses count:', whData.length);
    console.log('Direct Routes count:', routData.length);

  } catch (e) {
    console.error('Error parsing:', e.message, repRes.body);
  }
}

run();
