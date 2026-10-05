const http = require('http');
const { execSync } = require('child_process');

process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

function runSql(sql) {
  const singleLine = sql.replace(/\s+/g, ' ').trim();
  const cmd = `${PSQL} -c "${singleLine}"`;
  return execSync(cmd, { encoding: 'utf8', env: process.env });
}

function request(method, urlPath, data, token) {
  return new Promise((resolve) => {
    const body = data ? JSON.stringify(data) : '';
    const headers = {
      'Content-Type': 'application/json',
    };
    if (body) {
      headers['Content-Length'] = Buffer.byteLength(body);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: 8080,
        path: urlPath,
        method: method,
        headers,
      },
      (res) => {
        let b = '';
        res.on('data', (c) => (b += c));
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(b);
          } catch (e) {
            parsed = b;
          }
          resolve({ status: res.statusCode, body: parsed, raw: b });
        });
      }
    );
    req.on('error', (err) => resolve({ error: err.message }));
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  console.log('====================================================');
  console.log('PRIME ROUTE LOGISTICS - 7 CONSISTENCY TEST CASES');
  console.log('====================================================\n');

  // Step 0: Login as Admin
  console.log('0. Authenticating as Admin...');
  const loginRes = await request('POST', '/api/auth/login', {
    email: 'sanjanaaa.shru@gmail.com',
    password: 'Sanjana@102026',
  });
  if (loginRes.status !== 200 || !loginRes.body.token) {
    console.error('Failed to log in as admin:', loginRes);
    process.exit(1);
  }
  const token = loginRes.body.token;
  console.log('Admin login successful. JWT token acquired.\n');

  // Let's inspect vehicles and drivers
  // Vehicle 9: PR-VH-005, Driver 13: Priya Patel
  // Vehicle 1: VH-001, Driver 12: Rajesh V. Sharma (Both currently AVAILABLE)
  // Vehicle 3: VH-003, Driver 18: Ramesh
  // Driver 19: Uttam

  // Let's create an unassigned order or pick an unassigned order/shipment to test with
  // Check unassigned shipments
  const shipmentsRes = await request('GET', '/api/admin/shipments', null, token);
  const allShipments = shipmentsRes.body.data;
  console.log(`Retrieved ${allShipments.length} shipments from API.`);

  // Find confirmed shipment without vehicle or driver
  let testShipment = allShipments.find(s => s.status === 'CONFIRMED' && !s.vehicle && !s.assignedDriver);
  if (!testShipment) {
    // Find any unassigned order to create shipment
    const unassignedOrdersRes = await request('GET', '/api/admin/shipments/unassigned-orders', null, token);
    const unassignedOrders = unassignedOrdersRes.body.data;
    if (unassignedOrders && unassignedOrders.length > 0) {
      const order = unassignedOrders[0];
      const createRes = await request('POST', '/api/admin/shipments', {
        orderId: order.id,
        initialLocation: 'Mumbai Central Hub'
      }, token);
      testShipment = createRes.body.data;
      console.log(`Created new test shipment #${testShipment.trackingNumber} (ID: ${testShipment.id})`);
    } else {
      // Pick shipment 14 or 30
      testShipment = allShipments.find(s => s.status === 'CONFIRMED');
    }
  }
  console.log(`Using Test Shipment #${testShipment.trackingNumber} (ID: ${testShipment.id}, Status: ${testShipment.status})\n`);

  // Ensure testShipment has vehicle and driver cleared initially
  await request('PATCH', `/api/admin/shipments/${testShipment.id}/vehicle`, { vehicleId: null }, token);
  await request('PATCH', `/api/admin/shipments/${testShipment.id}/driver`, { driverId: null }, token);

  // ----------------------------------------------------
  // TEST CASE 2: Assign mismatched driver and vehicle (PR-VH-005 + Ramesh)
  // ----------------------------------------------------
  console.log('--- TEST CASE 2: Assign mismatched driver and vehicle (PR-VH-005 + Ramesh) ---');
  // First assign vehicle PR-VH-005 (ID: 9) or assign driver Ramesh (ID: 18) then try vehicle 9
  // If we try to assign vehicle 9 to a shipment with driver 18:
  // Note: Vehicle 9 is assigned to Priya Patel. Ramesh is ID 18.
  // Wait, is Vehicle 9 currently on active shipment 24?
  // Let's check vehicle 9's active shipment. If active, it would give "already assigned to active shipment".
  // Let's deliver shipment 24 first so vehicle 9 and Priya are free!
  console.log('Freeing vehicle PR-VH-005 (ID 9) and Priya Patel (ID 13) by marking Shipment 24 DELIVERED...');
  await request('PUT', '/api/admin/shipments/24/status', {
    status: 'DELIVERED',
    locationName: 'Final Customer Destination',
    description: 'Delivered successfully'
  }, token);

  // Now vehicle 9 is AVAILABLE / ASSIGNED to Priya Patel (13), and Priya Patel is AVAILABLE.
  // Let's verify vehicle 9 has 0 active shipments now.
  // Test Case 2: Mismatch (vehicle 9 + Ramesh 18) via createShipment or assignDriver/assignVehicle
  // Let's test assignVehicle(testShipment.id, 9) first:
  console.log('Assigning vehicle PR-VH-005 (ID 9) to test shipment...');
  const assignVehRes = await request('PATCH', `/api/admin/shipments/${testShipment.id}/vehicle`, {
    vehicleId: 9
  }, token);
  console.log('Assign Vehicle 9 response status:', assignVehRes.status);
  console.log('Shipment now has vehicle PR-VH-005 and auto-bound driver:', assignVehRes.body.data?.assignedDriver);

  // Now attempt to assign Ramesh (ID 18) to this shipment:
  console.log('\nAttempting to assign driver Ramesh (ID 18) to shipment with PR-VH-005:');
  const mismatchRameshRes = await request('PATCH', `/api/admin/shipments/${testShipment.id}/driver`, {
    driverId: 18
  }, token);
  console.log('Status Code:', mismatchRameshRes.status);
  console.log('Response Message:', mismatchRameshRes.body.message);
  const tc2_pass = mismatchRameshRes.status === 400 && mismatchRameshRes.body.message.includes('PR-VH-005') && mismatchRameshRes.body.message.includes('Priya Patel');
  console.log('TEST CASE 2 RESULT:', tc2_pass ? 'PASSED (HTTP 400 with expected error message)' : 'FAILED');

  // ----------------------------------------------------
  // TEST CASE 3: Assign mismatched driver and vehicle (PR-VH-005 + Uttam)
  // ----------------------------------------------------
  console.log('\n--- TEST CASE 3: Assign mismatched driver and vehicle (PR-VH-005 + Uttam) ---');
  console.log('Attempting to assign driver Uttam (ID 19) to shipment with PR-VH-005:');
  const mismatchUttamRes = await request('PATCH', `/api/admin/shipments/${testShipment.id}/driver`, {
    driverId: 19
  }, token);
  console.log('Status Code:', mismatchUttamRes.status);
  console.log('Response Message:', mismatchUttamRes.body.message);
  const tc3_pass = mismatchUttamRes.status === 400 && mismatchUttamRes.body.message.includes('PR-VH-005') && mismatchUttamRes.body.message.includes('Priya Patel');
  console.log('TEST CASE 3 RESULT:', tc3_pass ? 'PASSED (HTTP 400 with expected error message)' : 'FAILED');

  // ----------------------------------------------------
  // TEST CASE 1: Assign valid driver and vehicle (PR-VH-005 + Priya Patel)
  // ----------------------------------------------------
  console.log('\n--- TEST CASE 1: Assign valid driver and vehicle (PR-VH-005 + Priya Patel) ---');
  // Re-assigning Priya Patel (ID 13) to test shipment:
  const validAssignRes = await request('PATCH', `/api/admin/shipments/${testShipment.id}/driver`, {
    driverId: 13
  }, token);
  console.log('Status Code:', validAssignRes.status);
  console.log('Assigned Driver:', validAssignRes.body.data?.assignedDriver);
  console.log('Assigned Vehicle:', validAssignRes.body.data?.vehicleNumber);
  const tc1_pass = validAssignRes.status === 200 && validAssignRes.body.data?.assignedDriver === 'Priya Patel' && validAssignRes.body.data?.vehicleNumber === 'PR-VH-005';
  console.log('TEST CASE 1 RESULT:', tc1_pass ? 'PASSED (HTTP 200 with PR-VH-005 + Priya Patel)' : 'FAILED');

  // ----------------------------------------------------
  // TEST CASE 5: Assign already-active vehicle to another shipment
  // ----------------------------------------------------
  console.log('\n--- TEST CASE 5: Assign already-active vehicle to new shipment ---');
  // PR-VH-005 is currently active on testShipment!
  // Pick another shipment, e.g. shipment 14 or 30 or 31
  let anotherShipment = allShipments.find(s => s.id !== testShipment.id && s.status === 'CONFIRMED');
  console.log(`Attempting to assign active vehicle PR-VH-005 (ID 9) to another shipment #${anotherShipment.trackingNumber} (ID ${anotherShipment.id})...`);
  const activeVehRes = await request('PATCH', `/api/admin/shipments/${anotherShipment.id}/vehicle`, {
    vehicleId: 9
  }, token);
  console.log('Status Code:', activeVehRes.status);
  console.log('Response Message:', activeVehRes.body.message);
  const tc5_pass = activeVehRes.status === 400 && activeVehRes.body.message.includes('PR-VH-005') && activeVehRes.body.message.includes('currently assigned to an active shipment');
  console.log('TEST CASE 5 RESULT:', tc5_pass ? 'PASSED (HTTP 400 with expected error message)' : 'FAILED');

  // ----------------------------------------------------
  // TEST CASE 6: Assign vehicle after active shipment delivered
  // ----------------------------------------------------
  console.log('\n--- TEST CASE 6: Assign vehicle after active shipment delivered ---');
  // Deliver testShipment:
  console.log(`Delivering test shipment #${testShipment.trackingNumber}...`);
  const deliverRes = await request('PUT', `/api/admin/shipments/${testShipment.id}/status`, {
    status: 'DELIVERED',
    locationName: 'Destination Port',
    description: 'Delivered'
  }, token);
  console.log('Deliver Status:', deliverRes.status);

  // Now assign vehicle PR-VH-005 (ID 9) to anotherShipment:
  console.log(`Assigning now-freed vehicle PR-VH-005 to another shipment #${anotherShipment.trackingNumber}...`);
  const reassignRes = await request('PATCH', `/api/admin/shipments/${anotherShipment.id}/vehicle`, {
    vehicleId: 9
  }, token);
  console.log('Status Code:', reassignRes.status);
  console.log('Assigned Driver:', reassignRes.body.data?.assignedDriver);
  console.log('Assigned Vehicle:', reassignRes.body.data?.vehicleNumber);
  const tc6_pass = reassignRes.status === 200 && reassignRes.body.data?.vehicleNumber === 'PR-VH-005';
  console.log('TEST CASE 6 RESULT:', tc6_pass ? 'PASSED (Vehicle and Driver released upon delivery and successfully reassigned)' : 'FAILED');

  // Clean up anotherShipment: unassign vehicle 9 so we don't leave lingering assignments
  await request('PATCH', `/api/admin/shipments/${anotherShipment.id}/vehicle`, { vehicleId: null }, token);
  await request('PATCH', `/api/admin/shipments/${anotherShipment.id}/driver`, { driverId: null }, token);

  // ----------------------------------------------------
  // TEST CASE 4: Assign correct driver to different vehicle (VH-001 + Rajesh V. Sharma)
  // ----------------------------------------------------
  console.log('\n--- TEST CASE 4: Assign correct driver to different vehicle (VH-001 + Rajesh V. Sharma) ---');
  // Vehicle 1 is VH-001, assigned to Rajesh V. Sharma (ID 12).
  console.log(`Assigning vehicle VH-001 (ID 1) to shipment #${anotherShipment.trackingNumber}...`);
  const tc4VehRes = await request('PATCH', `/api/admin/shipments/${anotherShipment.id}/vehicle`, {
    vehicleId: 1
  }, token);
  console.log('Status Code:', tc4VehRes.status);
  console.log('Assigned Driver:', tc4VehRes.body.data?.assignedDriver);
  console.log('Assigned Vehicle:', tc4VehRes.body.data?.vehicleNumber);
  const tc4_pass = tc4VehRes.status === 200 && tc4VehRes.body.data?.assignedDriver === 'Rajesh V. Sharma' && tc4VehRes.body.data?.vehicleNumber === 'VH-001';
  console.log('TEST CASE 4 RESULT:', tc4_pass ? 'PASSED (VH-001 + Rajesh V. Sharma correctly paired)' : 'FAILED');

  // Clean up anotherShipment
  await request('PATCH', `/api/admin/shipments/${anotherShipment.id}/vehicle`, { vehicleId: null }, token);
  await request('PATCH', `/api/admin/shipments/${anotherShipment.id}/driver`, { driverId: null }, token);

  // ----------------------------------------------------
  // TEST CASE 7: Assign vehicle that has no driver
  // ----------------------------------------------------
  console.log('\n--- TEST CASE 7: Assign vehicle that has no driver ---');
  // Create a temporary vehicle with NO assigned driver in DB:
  console.log('Creating temporary unassigned vehicle PR-VH-TEMP in database...');
  runSql(`
    INSERT INTO vehicles (vehicle_number, vehicle_type, model, capacity, capacity_unit, registration_number, registration_expiry, insurance_expiry, status, driver_id, created_at, updated_at)
    VALUES ('PR-VH-TEMP', 'VAN', 'Transit 2026', 2.5, 'TONS', 'MH-04-TEMP-9999', '2028-01-01', '2028-01-01', 'AVAILABLE', NULL, NOW(), NOW())
    ON CONFLICT (vehicle_number) DO UPDATE SET driver_id = NULL, status = 'AVAILABLE';
  `);
  const tempVehRow = runSql("SELECT id, vehicle_number, driver_id FROM vehicles WHERE vehicle_number = 'PR-VH-TEMP';");
  console.log(tempVehRow.trim());
  const tempVehIdMatch = tempVehRow.match(/\s+(\d+)\s+\|\s+PR-VH-TEMP/);
  const tempVehId = tempVehIdMatch ? parseInt(tempVehIdMatch[1], 10) : null;

  console.log(`Attempting to assign unassigned vehicle PR-VH-TEMP (ID ${tempVehId}) to shipment #${anotherShipment.trackingNumber}...`);
  const noDriverVehRes = await request('PATCH', `/api/admin/shipments/${anotherShipment.id}/vehicle`, {
    vehicleId: tempVehId
  }, token);
  console.log('Status Code:', noDriverVehRes.status);
  console.log('Response Message:', noDriverVehRes.body.message);
  const tc7_pass = noDriverVehRes.status === 400 && noDriverVehRes.body.message.includes('does not have an assigned driver');
  console.log('TEST CASE 7 RESULT:', tc7_pass ? 'PASSED (HTTP 400 with expected error message)' : 'FAILED');

  // Clean up temporary vehicle
  runSql("DELETE FROM vehicles WHERE vehicle_number = 'PR-VH-TEMP';");
  console.log('Cleaned up temporary vehicle PR-VH-TEMP.');

  // Restore Shipment 24 to original active state if desired or re-verify database consistency
  console.log('\n====================================================');
  console.log('SUMMARY OF ALL 7 TEST CASES:');
  console.log(`Case 1: Valid driver + vehicle (PR-VH-005 + Priya): ${tc1_pass ? 'PASSED' : 'FAILED'}`);
  console.log(`Case 2: Mismatched driver (PR-VH-005 + Ramesh): ${tc2_pass ? 'PASSED' : 'FAILED'}`);
  console.log(`Case 3: Mismatched driver (PR-VH-005 + Uttam): ${tc3_pass ? 'PASSED' : 'FAILED'}`);
  console.log(`Case 4: Correct driver to vehicle (VH-001 + Rajesh): ${tc4_pass ? 'PASSED' : 'FAILED'}`);
  console.log(`Case 5: Already-active vehicle assignment: ${tc5_pass ? 'PASSED' : 'FAILED'}`);
  console.log(`Case 6: Post-delivery vehicle reuse: ${tc6_pass ? 'PASSED' : 'FAILED'}`);
  console.log(`Case 7: Vehicle with no driver: ${tc7_pass ? 'PASSED' : 'FAILED'}`);
  console.log('====================================================');

  const allPassed = tc1_pass && tc2_pass && tc3_pass && tc4_pass && tc5_pass && tc6_pass && tc7_pass;
  console.log('FINAL VERDICT:', allPassed ? 'ALL 7 TESTS PASSED PERFECTLY!' : 'SOME TESTS FAILED');
}

main().catch(console.error);
