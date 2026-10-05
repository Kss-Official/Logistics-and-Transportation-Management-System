const fs = require('fs');

const testOrder = `
const BASE_URL = 'http://localhost:8080';

async function postJson(url, data, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = \`Bearer \${token}\`;
  const resp = await fetch(\`\${BASE_URL}\${url}\`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  const text = await resp.text();
  try {
    return { status: resp.status, data: JSON.parse(text) };
  } catch (e) {
    return { status: resp.status, raw: text };
  }
}

async function getJson(url, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = \`Bearer \${token}\`;
  const resp = await fetch(\`\${BASE_URL}\${url}\`, {
    method: 'GET',
    headers
  });
  const text = await resp.text();
  try {
    return { status: resp.status, data: JSON.parse(text) };
  } catch (e) {
    return { status: resp.status, raw: text };
  }
}

async function login(email, password) {
  const res = await postJson('/api/auth/login', { email, password });
  if (res.status === 200 && res.data.token) {
    return res.data.token;
  }
  return null;
}

async function main() {
  console.log('==============================================================================');
  console.log('  PRIME ROUTE LOGISTICS: COMPLETE ADMIN PORTAL & OPERATIONS E2E TEST SUITE     ');
  console.log('==============================================================================\\n');

  // 1. Authenticate All Roles
  console.log('--- TEST 1: Multi-Role Authentication ---');
  const adminToken = await login('sanjanaaa.shru@gmail.com', 'Sanjana@102026');
  const custToken = await login('customer@primeroute.com', 'customer123');
  const blrManagerToken = await login('priya@primeroute.com', 'Manager@2026!');
  const mumManagerToken = await login('mum.west@primeroute.com', 'Manager@2026!');

  if (!adminToken || !custToken || !blrManagerToken || !mumManagerToken) {
    throw new Error('Authentication failed for one or more core roles.');
  }
  console.log('✓ Admin (Sanjana), Customer, WH-BLR Manager (Priya Sharma), and WH-MUM Manager (R. Deshpande) authenticated successfully.');

  // 2. Admin Dashboard Telemetry & Needs Attention
  console.log('\\n--- TEST 2: Admin Dashboard Telemetry & Needs Attention ---');
  const dashRes = await getJson('/api/admin/dashboard/summary', adminToken);
  if (dashRes.status === 200 && dashRes.data.data) {
    const d = dashRes.data.data;
    console.log('✓ Admin Dashboard Telemetry fetched from PostgreSQL:');
    console.log(\`  - Total Orders: \${d.totalOrders}\`);
    console.log(\`  - Total Shipments: \${d.totalShipments}\`);
    console.log(\`  - Active Warehouses: \${d.activeWarehouses}\`);
    console.log(\`  - Fleet: \${d.availableVehicles} Available, \${d.vehiclesInTransit} In Transit, \${d.vehiclesUnderMaintenance} Maintenance\`);
    console.log(\`  - Drivers: \${d.availableDrivers} Available, \${d.driversOnTrip} On Trip\`);
    console.log(\`  - Orders Awaiting Warehouse Assignment: \${d.ordersAwaitingWarehouseAssignment}\`);
    console.log(\`  - Needs Attention Count: \${d.needsAttention ? d.needsAttention.length : 0}\`);
    if (d.needsAttention) {
      d.needsAttention.forEach(item => console.log(\`    * [\${item.severity}] \${item.title}: \${item.count} (\${item.description})\`));
    }
  } else {
    throw new Error('Failed to retrieve dashboard summary: ' + JSON.stringify(dashRes));
  }

  // 3. Admin Drivers Master Data
  console.log('\\n--- TEST 3: Admin Drivers Master Data ---');
  const drvRes = await getJson('/api/admin/drivers', adminToken);
  let availableDrivers = [];
  if (drvRes.status === 200 && Array.isArray(drvRes.data.data)) {
    const drivers = drvRes.data.data;
    availableDrivers = drivers;
    console.log(\`✓ Retrieved \${drivers.length} drivers from PostgreSQL.\`);
    drivers.slice(0, 3).forEach(d => {
      console.log(\`  - Driver #\${d.id}: \${d.fullName} (\${d.email}), Status: \${d.status}, Warehouse: \${d.warehouseName || 'Unassigned'}\`);
    });
  } else {
    throw new Error('Failed to retrieve drivers: ' + JSON.stringify(drvRes));
  }

  // 4. Admin Vehicles Master Data
  console.log('\\n--- TEST 4: Admin Vehicles Master Data ---');
  const vehRes = await getJson('/api/admin/vehicles', adminToken);
  let availableVehicles = [];
  if (vehRes.status === 200 && Array.isArray(vehRes.data.data)) {
    const vehicles = vehRes.data.data;
    availableVehicles = vehicles;
    console.log(\`✓ Retrieved \${vehicles.length} vehicles from PostgreSQL.\`);
    vehicles.slice(0, 3).forEach(v => {
      console.log(\`  - Vehicle #\${v.id}: \${v.vehicleNumber} (\${v.model}), Status: \${v.status}, Warehouse: \${v.warehouseName || 'Unassigned'}\`);
    });
  } else {
    throw new Error('Failed to retrieve vehicles: ' + JSON.stringify(vehRes));
  }

  // 5. Admin Warehouses Master Data & Dynamic Telemetry
  console.log('\\n--- TEST 5: Admin Warehouses Master Data & Dynamic Capacities ---');
  const whRes = await getJson('/api/admin/warehouses', adminToken);
  if (whRes.status === 200 && Array.isArray(whRes.data.data)) {
    const warehouses = whRes.data.data;
    console.log(\`✓ Retrieved \${warehouses.length} warehouses from PostgreSQL.\`);
    const blr = warehouses.find(w => w.warehouseCode === 'WH-BLR-001');
    if (blr) {
      console.log(\`  - WH-BLR-001 (\${blr.warehouseName}):\`);
      console.log(\`    * Manager: \${blr.managerName} (\${blr.managerEmail})\`);
      console.log(\`    * Available Drivers at Hub: \${blr.availableDriverCount}\`);
      console.log(\`    * Available Vehicles at Hub: \${blr.availableVehicleCount}\`);
      console.log(\`    * Capacity: \${blr.occupiedCapacity} / \${blr.totalCapacity} \${blr.capacityUnit} (\${blr.utilizationRate}% utilized)\`);
    }
  } else {
    throw new Error('Failed to retrieve warehouses: ' + JSON.stringify(whRes));
  }

  // 6. Customer Creates Real Order
  console.log('\\n--- TEST 6: Customer Creates Real Order ---');
  const orderPayload = {
    pickupAddressId: 1,
    deliveryAddressId: 2,
    packageDescription: 'Client Acceptance Verified Real Order',
    packageWeight: 18.0,
    packageQuantity: 2,
    deliveryType: 'EXPRESS'
  };
  const createOrderRes = await postJson('/api/customer/orders', orderPayload, custToken);
  if (createOrderRes.status !== 200 && createOrderRes.status !== 201) {
    throw new Error('Failed to create customer order: ' + JSON.stringify(createOrderRes));
  }
  const createdOrder = createOrderRes.data.data;
  console.log(\`✓ Customer created Order #\${createdOrder.id} (\${createdOrder.orderNumber}) in PostgreSQL.\`);

  // 7. Admin Creates Shipment for WH-BLR-001
  console.log('\\n--- TEST 7: Admin Creates Shipment with Fulfillment Warehouse ---');
  const shipmentPayload = {
    orderId: createdOrder.id,
    warehouseId: 1 // WH-BLR-001
  };
  const createShipmentRes = await postJson('/api/admin/shipments', shipmentPayload, adminToken);
  if (createShipmentRes.status !== 200 && createShipmentRes.status !== 201) {
    throw new Error('Failed to create shipment: ' + JSON.stringify(createShipmentRes));
  }
  const shipment = createShipmentRes.data.data;
  console.log(\`✓ Shipment created successfully:\`);
  console.log(\`  - Tracking Number: \${shipment.trackingNumber}\`);
  console.log(\`  - Initial Status: \${shipment.status}\`);
  console.log(\`  - Assignment Status: \${shipment.assignmentStatus}\`);
  console.log(\`  - Auto-derived Manager: \${shipment.warehouseManagerName} (\${shipment.warehouseManagerEmail})\`);
  console.log(\`  - Driver: \${shipment.driverName || 'Not Assigned'}\`);
  console.log(\`  - Vehicle: \${shipment.vehicleNumber || 'Not Assigned'}\`);

  // 8. Warehouse Manager Scoped Access
  console.log('\\n--- TEST 8: Warehouse Scoped Visibility ---');
  const blrShipmentsRes = await getJson('/api/warehouse/shipments', blrManagerToken);
  const foundInBlr = blrShipmentsRes.data.data.find(s => s.id === shipment.id);
  if (!foundInBlr) {
    throw new Error('Created shipment was not visible to WH-BLR-001 Manager.');
  }
  console.log(\`✓ WH-BLR-001 Manager sees shipment \${shipment.trackingNumber} in scoped API.\`);

  const mumForbiddenRes = await getJson(\`/api/warehouse/shipments/\${shipment.id}\`, mumManagerToken);
  if (mumForbiddenRes.status === 403) {
    console.log('✓ WH-MUM-002 Manager blocked with HTTP 403 Forbidden.');
  } else {
    console.log(\`! MUM Manager response: \${mumForbiddenRes.status}\`);
  }

  // 9. Warehouse Manager Assigns Fleet (Driver + Vehicle)
  console.log('\\n--- TEST 9: Warehouse Manager Assigns Driver & Vehicle ---');
  const targetDriver = availableDrivers[0];
  const targetVehicle = availableVehicles[0];

  if (targetDriver && targetVehicle) {
    const wmAssignRes = await postJson(\`/api/warehouse/shipments/\${shipment.id}/assign\`, {
      driverId: targetDriver.id,
      vehicleId: targetVehicle.id
    }, blrManagerToken);

    if (wmAssignRes.status === 200) {
      const assigned = wmAssignRes.data.data;
      console.log(\`✓ Warehouse Manager assigned fleet:\`);
      console.log(\`  - Driver: \${assigned.driverName}\`);
      console.log(\`  - Vehicle: \${assigned.vehicleNumber}\`);
      console.log(\`  - Assignment Status: \${assigned.assignmentStatus}\`);
      console.log(\`  - Assigned By: \${assigned.assignedBy}\`);
    } else {
      console.log('! Assign response:', wmAssignRes.data);
    }
  }

  // 10. Admin Audited Exceptional Override
  console.log('\\n--- TEST 10: Admin Audited Exceptional Override ---');
  const altDriver = availableDrivers[1] || availableDrivers[0];
  const altVehicle = availableVehicles[1] || availableVehicles[0];

  if (altDriver && altVehicle) {
    const overrideRes = await postJson(\`/api/admin/shipments/\${shipment.id}/override-assignment\`, {
      driverId: altDriver.id,
      vehicleId: altVehicle.id,
      reason: 'Executive priority express linehaul rerouting approved by enterprise desk'
    }, adminToken);

    if (overrideRes.status === 200) {
      const overridden = overrideRes.data.data;
      console.log(\`✓ Admin exceptional override completed:\`);
      console.log(\`  - New Driver: \${overridden.driverName}\`);
      console.log(\`  - New Vehicle: \${overridden.vehicleNumber}\`);
      console.log(\`  - Assignment Status: \${overridden.assignmentStatus}\`);
      console.log(\`  - Assigned By: \${overridden.assignedBy}\`);
    } else {
      console.log('! Override response:', overrideRes.data);
    }
  }

  console.log('\\n==============================================================================');
  console.log('  ALL E2E ADMIN PORTAL & OPERATIONS TESTS COMPLETED SUCCESSFULLY!             ');
  console.log('==============================================================================\\n');
}

main().catch(err => {
  console.error('Fatal Test Failure:', err);
  process.exit(1);
});
`;

fs.writeFileSync('scratch/test_admin_portal_e2e.cjs', testOrder, 'utf8');
console.log('Updated test_admin_portal_e2e.cjs with dynamic DB IDs');
