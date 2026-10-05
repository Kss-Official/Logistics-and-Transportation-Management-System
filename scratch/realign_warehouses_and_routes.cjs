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

  console.log('--- UPDATING ROUTES FOR 2 HUBS (BENGALURU & KOLKATA) ---');

  // 1. Route 4: Bengaluru Central Hub -> Chennai Freight Terminal (Ramesh Kumar, VH-001)
  const r4 = {
    routeCode: 'RT-BLR-MAA-04',
    routeName: 'Bengaluru Central Hub → Chennai Freight Terminal',
    origin: 'Bengaluru Central Hub',
    originName: 'Bengaluru Central Hub',
    originCity: 'Bengaluru',
    originState: 'Karnataka',
    originAddress: 'Hosur Road, Electronic City, Bengaluru, Karnataka 560100',
    originLatitude: 12.8452,
    originLongitude: 77.6602,
    destination: 'Chennai Freight Terminal',
    destinationName: 'Chennai Freight Terminal',
    destinationCity: 'Chennai',
    destinationState: 'Tamil Nadu',
    destinationAddress: 'Grand Southern Trunk Rd, Meenambakkam, Chennai, Tamil Nadu 600027',
    destinationLatitude: 12.9818,
    destinationLongitude: 80.1639,
    distanceKm: 345.0,
    estimatedTransitTimeHours: 6.5,
    status: 'ACTIVE',
    driverId: 20,
    vehicleId: 1
  };
  const res4 = await put('/api/admin/routes/4', r4, token);
  console.log('Updated Route 4 (Bengaluru -> Chennai):', res4.status);

  // 2. Route 3: Bengaluru Central Hub -> Mysuru Industrial Corridor (Anil Deshmukh, KA-01-OVR-2890)
  const r3 = {
    routeCode: 'RT-BLR-MYS-03',
    routeName: 'Bengaluru Central Hub → Mysuru Industrial Corridor',
    origin: 'Bengaluru Central Hub',
    originName: 'Bengaluru Central Hub',
    originCity: 'Bengaluru',
    originState: 'Karnataka',
    originAddress: 'Hosur Road, Electronic City, Bengaluru, Karnataka 560100',
    originLatitude: 12.8452,
    originLongitude: 77.6602,
    destination: 'Mysuru Industrial Corridor',
    destinationName: 'Mysuru Industrial Corridor',
    destinationCity: 'Mysuru',
    destinationState: 'Karnataka',
    destinationAddress: 'Hebbal Industrial Area, Mysuru, Karnataka 570016',
    destinationLatitude: 12.3556,
    destinationLongitude: 76.5982,
    distanceKm: 145.0,
    estimatedTransitTimeHours: 3.2,
    status: 'ACTIVE',
    driverId: 21,
    vehicleId: 13
  };
  const res3 = await put('/api/admin/routes/3', r3, token);
  console.log('Updated Route 3 (Bengaluru -> Mysuru):', res3.status);

  // 3. Route 1: Bengaluru Central Hub -> Koramangala Tech Corridor (Standby)
  const r1 = {
    routeCode: 'RT-BLR-KRM-01',
    routeName: 'Bengaluru Central Hub → Koramangala Tech Corridor',
    origin: 'Bengaluru Central Hub',
    originName: 'Bengaluru Central Hub',
    originCity: 'Bengaluru',
    originState: 'Karnataka',
    originAddress: 'Hosur Road, Electronic City, Bengaluru, Karnataka 560100',
    originLatitude: 12.8452,
    originLongitude: 77.6602,
    destination: 'Koramangala Tech Corridor',
    destinationName: 'Koramangala Tech Corridor',
    destinationCity: 'Bengaluru',
    destinationState: 'Karnataka',
    destinationAddress: '80 Feet Rd, Koramangala 4th Block, Bengaluru, Karnataka 560034',
    destinationLatitude: 12.9352,
    destinationLongitude: 77.6245,
    distanceKm: 14.5,
    estimatedTransitTimeHours: 1.2,
    status: 'ACTIVE',
    driverId: null,
    vehicleId: null
  };
  const res1 = await put('/api/admin/routes/1', r1, token);
  console.log('Updated Route 1 (Bengaluru -> Koramangala Standby):', res1.status);

  // 4. Route 2: Kolkata Eastern Corridor Hub -> Haldia Port Terminal (Priya Patel, PR-VH-004)
  const r2 = {
    routeCode: 'RT-CCU-HLD-02',
    routeName: 'Kolkata Eastern Corridor Hub → Haldia Port Terminal',
    origin: 'Kolkata Eastern Corridor Hub',
    originName: 'Kolkata Eastern Corridor Hub',
    originCity: 'Kolkata',
    originState: 'West Bengal',
    originAddress: 'Rajarhat Main Road, Action Area II, Kolkata, West Bengal 700135',
    originLatitude: 22.5958,
    originLongitude: 88.4722,
    destination: 'Haldia Port Terminal',
    destinationName: 'Haldia Port Terminal',
    destinationCity: 'Haldia',
    destinationState: 'West Bengal',
    destinationAddress: 'Port Trust Road, Haldia Dock Complex, Haldia, West Bengal 721607',
    destinationLatitude: 22.0238,
    destinationLongitude: 88.0863,
    distanceKm: 125.0,
    estimatedTransitTimeHours: 3.5,
    status: 'ACTIVE',
    driverId: 13,
    vehicleId: 8
  };
  const res2 = await put('/api/admin/routes/2', r2, token);
  console.log('Updated Route 2 (Kolkata -> Haldia):', res2.status);

  // 5. Route 5: Kolkata Eastern Corridor Hub -> Durgapur Industrial Park (Sneha Kulkarni, PR-VH-005)
  const r5 = {
    routeCode: 'RT-CCU-DGP-05',
    routeName: 'Kolkata Eastern Corridor Hub → Durgapur Industrial Park',
    origin: 'Kolkata Eastern Corridor Hub',
    originName: 'Kolkata Eastern Corridor Hub',
    originCity: 'Kolkata',
    originState: 'West Bengal',
    originAddress: 'Rajarhat Main Road, Action Area II, Kolkata, West Bengal 700135',
    originLatitude: 22.5958,
    originLongitude: 88.4722,
    destination: 'Durgapur Industrial Park',
    destinationName: 'Durgapur Industrial Park',
    destinationCity: 'Durgapur',
    destinationState: 'West Bengal',
    destinationAddress: 'City Centre Industrial Zone, Durgapur, West Bengal 713216',
    destinationLatitude: 23.5204,
    destinationLongitude: 87.3119,
    distanceKm: 168.0,
    estimatedTransitTimeHours: 4.0,
    status: 'ACTIVE',
    driverId: 16,
    vehicleId: 9
  };
  const res5 = await put('/api/admin/routes/5', r5, token);
  console.log('Updated Route 5 (Kolkata -> Durgapur):', res5.status);

  console.log('\n--- UPDATING DRIVERS (2 in BENGALURU, 2 in KOLKATA) ---');
  // Ramesh Kumar (Bengaluru)
  await put('/api/admin/drivers/20', {
    fullName: 'Ramesh Kumar',
    email: 'ramesh@primeroute.com',
    phone: '+91 98765 43211',
    licenseNumber: 'KA01-2023-0098765',
    licenseExpiryDate: '2029-09-21',
    address: 'Whitefield, Bengaluru, Karnataka',
    status: 'AVAILABLE',
    warehouseId: 1,
    vehicleId: 1
  }, token);

  // Anil Deshmukh (Bengaluru)
  await put('/api/admin/drivers/21', {
    fullName: 'Anil Deshmukh',
    email: 'anil.deshmukh.1790082100291@primeroute.com',
    phone: '+91 9876572649',
    licenseNumber: 'DL-KA-E2E-11598',
    licenseExpiryDate: '2029-06-30',
    address: 'Indiranagar, Bengaluru, Karnataka',
    status: 'AVAILABLE',
    warehouseId: 1,
    vehicleId: 13
  }, token);

  // Priya Patel (Kolkata)
  await put('/api/admin/drivers/13', {
    fullName: 'Priya Patel',
    email: 'priya.patel@primeroute.in',
    phone: '+91 98234 56789',
    licenseNumber: 'GJ-0120150098765',
    licenseExpiryDate: '2030-05-15',
    address: 'New Town, Action Area I, Kolkata, West Bengal',
    status: 'AVAILABLE',
    warehouseId: 6,
    vehicleId: 8
  }, token);

  // Sneha Kulkarni (Kolkata)
  await put('/api/admin/drivers/16', {
    fullName: 'Sneha Kulkarni',
    email: 'sneha.kulkarni@primeroute.in',
    phone: '+91 97654 32100',
    licenseNumber: 'DL-KA-2022-0098765',
    licenseExpiryDate: '2027-09-24',
    address: 'Salt Lake Sector V, Kolkata, West Bengal',
    status: 'AVAILABLE',
    warehouseId: 6,
    vehicleId: 9
  }, token);

  console.log('Driver updates complete.');
}

run();
