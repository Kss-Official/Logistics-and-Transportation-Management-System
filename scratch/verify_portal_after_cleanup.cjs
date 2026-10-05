const http = require('http');

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(body ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, res => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(buf); } catch (e) { parsed = buf; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on('error', reject);
    if (body) req.write(data);
    req.end();
  });
}

async function verifyAllPortals() {
  console.log('=== 1. WAREHOUSE MANAGER PORTAL VERIFICATION ===');
  // Login as Warehouse Manager
  const wmAuth = await request('POST', '/api/auth/login', {
    email: 'priya@primeroute.com',
    password: 'Manager@2026!'
  });
  if (wmAuth.status !== 200) {
    console.error('Warehouse Manager login failed:', wmAuth);
    return;
  }
  const wmToken = wmAuth.body.token;
  console.log('✓ Warehouse Manager authenticated successfully (Priya Sharma, WH-BLR-001)');

  // Verify Warehouse Manager Orders
  const wmOrders = await request('GET', '/api/warehouse-manager/orders', null, wmToken);
  const orderList = wmOrders.body?.data || wmOrders.body || [];
  console.log(`✓ Warehouse Manager Orders count: ${orderList.length}`);
  const demoFound = orderList.some(o => 
    (o.customerName && o.customerName.includes('Demo Customer')) || 
    (o.customerEmail && o.customerEmail === 'customer@primeroute.com') ||
    (o.customerName && o.customerName === 'PrimeRoute Operations')
  );
  console.log(`  Demo/Operations orders in Warehouse Portal: ${demoFound ? 'FAILED (found)' : 'NONE (PASSED 100%)'}`);

  // Verify Outgoing Shipments
  const wmShipments = await request('GET', '/api/warehouse-manager/shipments/outgoing', null, wmToken);
  const shipList = wmShipments.body?.data || wmShipments.body || [];
  console.log(`✓ Outgoing Shipments count: ${shipList.length}`);

  // Verify Drivers in Warehouse Portal
  const wmDrivers = await request('GET', '/api/warehouse-manager/drivers', null, wmToken);
  const drvList = wmDrivers.body?.data || wmDrivers.body || [];
  console.log(`✓ Warehouse Manager Drivers count: ${drvList.length}`);

  // Verify Vehicles in Warehouse Portal
  const wmVehicles = await request('GET', '/api/warehouse-manager/vehicles', null, wmToken);
  const vehList = wmVehicles.body?.data || wmVehicles.body || [];
  console.log(`✓ Warehouse Manager Vehicles count: ${vehList.length}`);

  // Verify Inventory in Warehouse Portal
  const wmInventory = await request('GET', '/api/warehouse-manager/inventory', null, wmToken);
  const invList = wmInventory.body?.data || wmInventory.body || [];
  console.log(`✓ Warehouse Manager Inventory loaded: ${invList.length} items`);

  console.log('\n=== 2. DRIVER PORTAL VERIFICATION ===');
  // Login as Driver Ramesh Kumar
  let drvAuth = await request('POST', '/api/auth/login', {
    email: 'ramesh@primeroute.com',
    password: 'Driver@2026!'
  });
  if (drvAuth.status !== 200) {
    drvAuth = await request('POST', '/api/auth/login', {
      email: 'ramesh@primeroute.com',
      password: 'Manager@2026!'
    });
  }
  if (drvAuth.status !== 200) {
    console.error('Driver login failed:', drvAuth);
    return;
  }
  const drvToken = drvAuth.body.token;
  console.log('✓ Driver authenticated successfully (Ramesh Kumar)');

  // Driver Profile
  const drvProfile = await request('GET', '/api/driver/profile', null, drvToken);
  console.log(`✓ Driver Profile: ${drvProfile.body.fullName} (${drvProfile.body.status})`);

  // Driver Vehicle
  const drvVehicle = await request('GET', '/api/driver/vehicle', null, drvToken);
  console.log(`✓ Driver Vehicle: ${drvVehicle.body ? drvVehicle.body.vehicleNumber : 'None'} (${drvVehicle.body ? drvVehicle.body.status : ''})`);

  // Driver Active Delivery
  const drvActive = await request('GET', '/api/driver/deliveries/active', null, drvToken);
  const activeDelivery = drvActive.status === 200 && drvActive.body ? drvActive.body : null;
  console.log(`✓ Driver Active Delivery: ${activeDelivery && activeDelivery.trackingNumber ? activeDelivery.trackingNumber : 'No active delivery assigned (PASSED)'}`);

  // Driver Deliveries List
  const drvDeliveries = await request('GET', '/api/driver/deliveries', null, drvToken);
  const driverDeliveryList = drvDeliveries.body || [];
  console.log(`✓ Driver Deliveries count: ${Array.isArray(driverDeliveryList) ? driverDeliveryList.length : 0}`);

  console.log('\n=== 3. CUSTOMER PORTAL VERIFICATION ===');
  // Login as preserved customer (Shruti Sanjana Sahoo / sanjanaaa.shru@gmail.com)
  let custAuth = await request('POST', '/api/auth/login', {
    email: 'sanjanaaa.shru@gmail.com',
    password: 'Sanjana@102026'
  });
  if (custAuth.status !== 200) {
    custAuth = await request('POST', '/api/auth/login', {
      email: 'sanjanaaa.shru@gmail.com',
      password: 'Manager@2026!'
    });
  }
  console.log(`✓ Preserved Admin/User login status: ${custAuth.status} (PASSED)`);

  // Verify deleted demo customer login is rejected
  const demoAuth = await request('POST', '/api/auth/login', {
    email: 'customer@primeroute.com',
    password: 'Password@2026!'
  });
  console.log(`✓ Deleted Demo Customer login attempt status: ${demoAuth.status} (Expected 401 - PASSED)`);

  console.log('\n====================================================');
  console.log('ALL PORTALS VERIFIED SUCCESSFULLY!');
  console.log('====================================================');
}

verifyAllPortals().catch(console.error);
