const axios = require('axios');

const API = 'http://localhost:8080/api';
const unwrap = (res) => res.data?.data !== undefined ? res.data.data : res.data;

async function testFutureDynamic() {
  console.log("=== TESTING FUTURE DYNAMIC CAPABILITY ===");

  const adminLogin = await axios.post(`${API}/auth/login`, {
    email: 'sanjanaaa.shru@gmail.com',
    password: 'Sanjana@102026'
  });
  const adminToken = adminLogin.data.token;
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  // Delete test warehouse 10 if it was created
  try {
    const allWh = unwrap(await axios.get(`${API}/admin/warehouses`, { headers: adminHeaders }));
    const hyd = allWh.find(w => w.warehouseCode === 'WH-HYD-TEST');
    if (hyd) {
      await axios.delete(`${API}/admin/warehouses/${hyd.id}`, { headers: adminHeaders });
    }
  } catch (e) {}

  // 1. Add a new warehouse
  const newWhResp = await axios.post(`${API}/admin/warehouses`, {
    warehouseCode: 'WH-HYD-TEST',
    warehouseName: 'Hyderabad Test Depot',
    warehouseType: 'TRANSIT_HUB',
    status: 'ACTIVE',
    managerName: 'Vikram Rao',
    managerEmail: 'vikram.rao@primeroute.com',
    managerPhone: '+91 9900011223',
    addressLine1: 'Airport Cargo Terminal',
    city: 'Hyderabad',
    state: 'Telangana',
    postalCode: '500409',
    country: 'India',
    totalCapacity: 5000,
    occupiedCapacity: 0,
    capacityUnit: 'KG',
    operatingHours: '24/7'
  }, { headers: adminHeaders });
  const newWh = unwrap(newWhResp);
  console.log('1. Created New Warehouse:', newWh.warehouseName, `(ID: ${newWh.id})`);

  // 2. Add a new driver
  const newDrvResp = await axios.post(`${API}/admin/drivers`, {
    fullName: 'Arjun Das',
    email: 'arjun.das@primeroute.in',
    phone: '+91 9123456780',
    licenseNumber: 'TS09-2026-0012345',
    licenseExpiryDate: '2029-12-31',
    address: 'Hyderabad Depot Bay 1',
    warehouseId: newWh.id,
    status: 'AVAILABLE'
  }, { headers: adminHeaders });
  const newDrv = unwrap(newDrvResp);
  console.log('2. Created New Driver:', newDrv.fullName, `(ID: ${newDrv.id})`);

  // 3. Add a new vehicle & assign driver and warehouse
  const newVehResp = await axios.post(`${API}/admin/vehicles`, {
    vehicleNumber: 'TS-09-EXP-1010',
    registrationNumber: 'TS-09-EXP-1010',
    vehicleType: 'TRUCK',
    manufacturer: 'BharatBenz',
    model: 'BharatBenz 2823R',
    capacity: 16.0,
    capacityUnit: 'TONS',
    warehouseId: newWh.id,
    driverId: newDrv.id,
    registrationExpiry: '2028-10-10',
    insuranceExpiry: '2027-10-10',
    currentLocation: 'Hyderabad Test Depot',
    status: 'ASSIGNED'
  }, { headers: adminHeaders });
  const newVeh = unwrap(newVehResp);
  console.log('3. Created & Assigned Vehicle:', newVeh.vehicleNumber, `-> Driver: ${newVeh.driverName}, Warehouse: ${newVeh.warehouseName}`);

  // 4. Login as newly created Hyderabad manager and check scoped fleet
  const mgrLogin = await axios.post(`${API}/auth/login`, {
    email: 'vikram.rao@primeroute.com',
    password: 'Manager@2026!'
  });
  const mgrHeaders = { Authorization: `Bearer ${mgrLogin.data.token}` };

  const mgrFleetDrivers = unwrap(await axios.get(`${API}/warehouse/drivers`, { headers: mgrHeaders }));
  const mgrFleetVehicles = unwrap(await axios.get(`${API}/warehouse/vehicles`, { headers: mgrHeaders }));

  console.log('4. Hyderabad Manager Scoped Drivers:', mgrFleetDrivers.map(d => d.fullName));
  console.log('4. Hyderabad Manager Scoped Vehicles:', mgrFleetVehicles.map(v => `${v.vehicleNumber} (Driver: ${v.currentDriver})`));

  // Clean up the temporary test entities created during this dynamic verification
  console.log('5. Cleaning up temporary test warehouse, driver, vehicle...');
  await axios.delete(`${API}/admin/vehicles/${newVeh.id}`, { headers: adminHeaders });
  await axios.delete(`${API}/admin/drivers/${newDrv.id}`, { headers: adminHeaders });
  await axios.delete(`${API}/admin/warehouses/${newWh.id}`, { headers: adminHeaders });
  console.log('Cleaned up test entities successfully.');
}

testFutureDynamic().catch(err => {
  console.error('Dynamic test error:', err.response ? err.response.data : err.message);
});
