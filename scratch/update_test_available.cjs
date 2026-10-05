const fs = require('fs');

let testScript = fs.readFileSync('scratch/test_admin_portal_e2e.cjs', 'utf8');

// Update Test 9 & 10 to pick available driver / vehicle or create an available test vehicle if none currently available
const updatedAssignmentSection = `
  // 9. Warehouse Manager Assigns Fleet (Driver + Vehicle)
  console.log('\\n--- TEST 9: Warehouse Manager Assigns Driver & Vehicle ---');
  let availDrv = availableDrivers.find(d => d.status === 'AVAILABLE');
  let availVeh = availableVehicles.find(v => v.status === 'AVAILABLE');

  // If no available vehicle in DB, register a real test vehicle
  if (!availVeh) {
    const newVehRes = await postJson('/api/admin/vehicles', {
      vehicleNumber: 'KA-01-E2E-' + Math.floor(1000 + Math.random() * 9000),
      vehicleType: 'TRUCK',
      manufacturer: 'Tata Motors',
      model: 'Ultra T.16',
      capacity: 12.0,
      capacityUnit: 'TONS',
      warehouseId: 1,
      registrationNumber: 'KA01E2E' + Math.floor(1000 + Math.random() * 9000),
      registrationExpiry: '2028-12-31',
      insuranceExpiry: '2028-12-31',
      currentLocation: 'Bengaluru Central Hub'
    }, adminToken);
    if (newVehRes.status === 200 || newVehRes.status === 201) {
      availVeh = newVehRes.data.data;
      console.log(\`✓ Registered new available fleet vehicle #\${availVeh.id} (\${availVeh.vehicleNumber})\`);
    }
  }

  if (availDrv && availVeh) {
    const wmAssignRes = await postJson(\`/api/warehouse/shipments/\${shipment.id}/assign\`, {
      driverId: availDrv.id,
      vehicleId: availVeh.id
    }, blrManagerToken);

    if (wmAssignRes.status === 200) {
      const assigned = wmAssignRes.data.data;
      console.log('✓ Warehouse Manager assigned fleet successfully:');
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
  // Create an alternate vehicle for override
  const altVehRes = await postJson('/api/admin/vehicles', {
    vehicleNumber: 'KA-01-OVR-' + Math.floor(1000 + Math.random() * 9000),
    vehicleType: 'TRUCK',
    manufacturer: 'BharatBenz',
    model: '1617R',
    capacity: 16.0,
    capacityUnit: 'TONS',
    warehouseId: 1,
    registrationNumber: 'KA01OVR' + Math.floor(1000 + Math.random() * 9000),
    registrationExpiry: '2028-12-31',
    insuranceExpiry: '2028-12-31',
    currentLocation: 'Bengaluru Central Hub'
  }, adminToken);
  const altVeh = altVehRes.data.data;

  // Create an alternate driver for override
  const altDrvRes = await postJson('/api/admin/drivers', {
    fullName: 'Anil Deshmukh',
    email: 'anil.deshmukh.' + Date.now() + '@primeroute.com',
    phone: '98765' + Math.floor(10000 + Math.random() * 90000),
    licenseNumber: 'DL-KA-E2E-' + Math.floor(10000 + Math.random() * 90000),
    licenseExpiryDate: '2029-06-30',
    address: 'Indiranagar, Bengaluru',
    warehouseId: 1,
    status: 'AVAILABLE'
  }, adminToken);
  const altDrv = altDrvRes.data.data;

  if (altDrv && altVeh) {
    const overrideRes = await postJson(\`/api/admin/shipments/\${shipment.id}/override-assignment\`, {
      driverId: altDrv.id,
      vehicleId: altVeh.id,
      reason: 'Executive priority express linehaul rerouting approved by enterprise desk'
    }, adminToken);

    if (overrideRes.status === 200) {
      const overridden = overrideRes.data.data;
      console.log('✓ Admin exceptional override completed:');
      console.log(\`  - New Driver: \${overridden.driverName}\`);
      console.log(\`  - New Vehicle: \${overridden.vehicleNumber}\`);
      console.log(\`  - Assignment Status: \${overridden.assignmentStatus}\`);
      console.log(\`  - Assigned By: \${overridden.assignedBy}\`);
    } else {
      console.log('! Override response:', overrideRes.data);
    }
  }
`;

testScript = testScript.replace(
  /\/\/ 9\. Warehouse Manager Assigns Fleet[\s\S]*?console\.log\('\\n===/,
  updatedAssignmentSection + "\n  console.log('\\n==="
);

fs.writeFileSync('scratch/test_admin_portal_e2e.cjs', testScript, 'utf8');
console.log('Updated test_admin_portal_e2e.cjs with available vehicle/driver handling');
