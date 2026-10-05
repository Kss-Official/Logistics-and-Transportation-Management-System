const axios = require('axios');

const API = 'http://localhost:8080/api';

const unwrap = (res) => res.data?.data !== undefined ? res.data.data : res.data;

async function testDynamic() {
  console.log("==================================================");
  console.log("DYNAMIC TEST: BENGALURU WAREHOUSE MANAGER");
  console.log("==================================================");
  
  const blrLogin = await axios.post(`${API}/auth/login`, {
    email: 'priya@primeroute.com',
    password: 'Manager@2026!'
  });
  const blrToken = blrLogin.data.token;
  const blrHeaders = { Authorization: `Bearer ${blrToken}` };

  const blrProfile = unwrap(await axios.get(`${API}/warehouse/profile`, { headers: blrHeaders }));
  console.log('Manager Warehouse:', blrProfile.warehouseName, `(${blrProfile.warehouseCode})`);

  const blrDrivers = unwrap(await axios.get(`${API}/warehouse/drivers`, { headers: blrHeaders }));
  console.log('Bengaluru Drivers count:', blrDrivers.length);
  console.log('Bengaluru Drivers:', blrDrivers.map(d => `${d.fullName} (${d.status})`));

  const blrVehicles = unwrap(await axios.get(`${API}/warehouse/vehicles`, { headers: blrHeaders }));
  console.log('Bengaluru Vehicles count:', blrVehicles.length);
  console.log('Bengaluru Vehicles:', blrVehicles.map(v => `${v.vehicleNumber} (${v.model}) -> Driver: ${v.currentDriver}`));

  console.log("\n==================================================");
  console.log("DYNAMIC TEST: KOLKATA WAREHOUSE MANAGER");
  console.log("==================================================");

  const ccuLogin = await axios.post(`${API}/auth/login`, {
    email: 'ccu.east@primeroute.com',
    password: 'Manager@2026!'
  });
  const ccuToken = ccuLogin.data.token;
  const ccuHeaders = { Authorization: `Bearer ${ccuToken}` };

  const ccuProfile = unwrap(await axios.get(`${API}/warehouse/profile`, { headers: ccuHeaders }));
  console.log('Manager Warehouse:', ccuProfile.warehouseName, `(${ccuProfile.warehouseCode})`);

  const ccuDrivers = unwrap(await axios.get(`${API}/warehouse/drivers`, { headers: ccuHeaders }));
  console.log('Kolkata Drivers count:', ccuDrivers.length);
  console.log('Kolkata Drivers:', ccuDrivers.map(d => `${d.fullName} (${d.status})`));

  const ccuVehicles = unwrap(await axios.get(`${API}/warehouse/vehicles`, { headers: ccuHeaders }));
  console.log('Kolkata Vehicles count:', ccuVehicles.length);
  console.log('Kolkata Vehicles:', ccuVehicles.map(v => `${v.vehicleNumber} (${v.model}) -> Driver: ${v.currentDriver}`));

  console.log("\n==================================================");
  console.log("ADMIN TEST");
  console.log("==================================================");

  const adminLogin = await axios.post(`${API}/auth/login`, {
    email: 'sanjanaaa.shru@gmail.com',
    password: 'Sanjana@102026'
  });
  const adminToken = adminLogin.data.token;
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  const adminWarehouses = unwrap(await axios.get(`${API}/admin/warehouses`, { headers: adminHeaders }));
  console.log('Admin Warehouses count:', adminWarehouses.length);
  adminWarehouses.forEach(w => console.log(`  Warehouse: ${w.warehouseName} (${w.warehouseCode}) - Manager: ${w.managerName}`));

  const adminDrivers = unwrap(await axios.get(`${API}/admin/drivers`, { headers: adminHeaders }));
  console.log('Admin Drivers count:', adminDrivers.length);
  adminDrivers.forEach(d => console.log(`  Driver: ${d.fullName} | Status: ${d.status} | Vehicle: ${d.vehicleNumber || 'None'} | Shipments: ${d.assignedShipmentsCount}`));

  const adminVehicles = unwrap(await axios.get(`${API}/admin/vehicles`, { headers: adminHeaders }));
  console.log('Admin Vehicles count:', adminVehicles.length);
  adminVehicles.forEach(v => console.log(`  Vehicle: ${v.vehicleNumber} | Driver: ${v.driverName} | Warehouse: ${v.warehouseName}`));
}

testDynamic().catch(err => {
  console.error('Test failed:', err.response ? err.response.data : err.message);
});
