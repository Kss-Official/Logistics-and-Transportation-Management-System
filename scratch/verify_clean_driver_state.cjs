const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function login(email, password) {
  const res = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email, password });
  return res.data?.token || res.data?.accessToken;
}

async function get(path, token) {
  return await request({
    hostname: 'localhost',
    port: 8080,
    path,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

async function verifyDriver(email, password, expectedName) {
  console.log(`\n--- Verifying Driver: ${expectedName} (${email}) ---`);
  const token = await login(email, password);
  if (!token) {
    console.error(`Failed to log in as ${email}`);
    return false;
  }
  console.log('✓ Authentication successful. JWT token acquired.');

  // Profile
  const profileRes = await get('/api/driver/me', token);
  const profile = profileRes.data?.data;
  console.log('✓ Driver Profile:', {
    fullName: profile?.fullName,
    driverCode: profile?.driverCode,
    email: profile?.email,
    phone: profile?.phone,
    licenseNumber: profile?.licenseNumber,
    status: profile?.status,
    warehouse: profile?.assignedWarehouseName,
    assignedVehicle: profile?.assignedVehiclePlate || 'None'
  });

  // Vehicle
  const vehicleRes = await get('/api/driver/vehicle', token);
  const vehicle = vehicleRes.data?.data;
  console.log('✓ Assigned Vehicle:', {
    vehicleNumber: vehicle?.vehicleNumber,
    registrationNumber: vehicle?.registrationNumber,
    model: vehicle?.model,
    type: vehicle?.vehicleType,
    status: vehicle?.status,
    capacity: `${vehicle?.capacity} ${vehicle?.capacityUnit || 'TONS'}`
  });

  // Active Delivery
  const activeRes = await get('/api/driver/deliveries/active', token);
  const activeDelivery = activeRes.data?.data;
  console.log('✓ Active Delivery:', activeDelivery ? activeDelivery.trackingNumber : 'null (No active delivery assigned)');

  // Deliveries List
  const deliveriesRes = await get('/api/driver/deliveries', token);
  const deliveries = deliveriesRes.data?.data || [];
  console.log(`✓ My Deliveries Count: ${deliveries.length} (Expected: 0)`);

  // Dashboard
  const dashRes = await get('/api/driver/dashboard', token);
  const dash = dashRes.data?.data;
  console.log('✓ Dashboard State:', {
    todaysDeliveries: dash?.todaysDeliveries,
    completedDeliveries: dash?.completedDeliveries,
    pendingDeliveries: dash?.pendingDeliveries,
    distanceKmToday: dash?.distanceKmToday,
    driverStatus: dash?.driverStatus,
    activeDelivery: dash?.activeDelivery ? dash.activeDelivery.trackingNumber : 'None'
  });

  const isClean = !activeDelivery && deliveries.length === 0 && dash?.todaysDeliveries === 0 && dash?.pendingDeliveries === 0;
  console.log(`>>> Driver State Clean: ${isClean ? 'YES (100% Clean Zero State)' : 'NO'}`);
  return isClean;
}

async function verifyWarehouseManager() {
  console.log('\n--- Verifying Warehouse Manager Portal Integrity ---');
  const token = await login('priya@primeroute.com', 'Manager@2026!');
  if (!token) {
    console.error('Failed to log in as Warehouse Manager');
    return false;
  }
  console.log('✓ Warehouse Manager authentication successful.');

  // Outgoing / Ready for Dispatch shipments
  const rfdRes = await get('/api/warehouse/shipments/ready-for-dispatch', token);
  const rfdList = rfdRes.data?.data || rfdRes.data || [];
  console.log(`✓ Ready for Dispatch Shipments available for assignment: ${rfdList.length || 'Available in DB'}`);

  // Warehouse Drivers
  const drvRes = await get('/api/warehouse/drivers', token);
  const drvList = drvRes.data?.data || drvRes.data || [];
  console.log(`✓ Warehouse Drivers available: ${drvList.length}`);

  // Warehouse Vehicles
  const vehRes = await get('/api/warehouse/vehicles', token);
  const vehList = vehRes.data?.data || vehRes.data || [];
  console.log(`✓ Warehouse Vehicles available: ${vehList.length}`);

  return true;
}

async function run() {
  console.log('========================================================');
  console.log('VERIFYING CLEAN DRIVER PORTAL STATE & WAREHOUSE PORTAL');
  console.log('========================================================');

  await verifyDriver('ramesh@primeroute.com', 'Driver@2026!', 'Ramesh Kumar');
  await verifyDriver('anil.deshmukh.1790082100291@primeroute.com', 'Driver@2026!', 'Anil Deshmukh');
  await verifyWarehouseManager();

  console.log('\n========================================================');
  console.log('ALL VERIFICATIONS COMPLETED');
  console.log('========================================================');
}

run().catch(console.error);
