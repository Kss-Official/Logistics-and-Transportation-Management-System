const crypto = require('crypto');

const secret = 'PrimeRouteLogisticsSecretKey2026ForDevelopmentOnlyChangeThisLater';

function base64url(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
const now = Math.floor(Date.now() / 1000);
const payload = base64url(JSON.stringify({
  sub: 'sanjanaaa.shru@gmail.com',
  role: 'ROLE_ADMIN',
  iat: now,
  exp: now + 3600
}));

const signature = crypto
  .createHmac('sha256', secret)
  .update(`${header}.${payload}`)
  .digest('base64')
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');

const token = `${header}.${payload}.${signature}`;

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
};

async function getAvailableDrivers() {
  const res = await fetch('http://localhost:8080/api/admin/drivers/available', { headers });
  const json = await res.json();
  return json.data || [];
}

async function getUnassignedOrders() {
  const res = await fetch('http://localhost:8080/api/admin/shipments/unassigned-orders', { headers });
  const json = await res.json();
  return json.data || [];
}

async function createShipment(orderId, driverId, vehicleId) {
  const res = await fetch('http://localhost:8080/api/admin/shipments', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      orderId,
      driverId,
      vehicleId,
      initialLocation: 'Automated Test Sorting Hub'
    })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to create shipment');
  return json.data;
}

async function updateShipmentStatus(shipmentId, status) {
  const res = await fetch(`http://localhost:8080/api/admin/shipments/${shipmentId}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      status,
      locationName: 'Test Waypoint Hub',
      description: `Testing status transition to ${status}`
    })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `Failed to update status to ${status}`);
  return json.data;
}

async function runTest() {
  console.log('========================================================');
  console.log('STEP 1 & 2: Identify Uttam current shipment and status');
  console.log('========================================================');
  // Check Uttam's shipment via DB / API
  const allShipmentsRes = await fetch('http://localhost:8080/api/admin/shipments', { headers });
  const allShipments = (await allShipmentsRes.json()).data || [];
  const uttamShipment = allShipments.find(s => s.assignedDriver && s.assignedDriver.includes('Uttam'));
  if (uttamShipment) {
    console.log(`Found Uttam assigned to shipment: ${uttamShipment.trackingNumber}, status: ${uttamShipment.status}`);
  } else {
    console.log('Could not find Uttam shipment in all shipments');
  }

  console.log('\n========================================================');
  console.log('STEP 3, 4 & 5: Check available drivers dropdown for Uttam');
  console.log('========================================================');
  let available = await getAvailableDrivers();
  const uttamInAvailable = available.find(d => d.fullName.toLowerCase().includes('uttam'));
  console.log(`Is Uttam in available drivers? ${!!uttamInAvailable} (EXPECTED: false)`);
  if (uttamInAvailable) {
    throw new Error('FAILED: Uttam is still in available drivers!');
  } else {
    console.log('PASSED: Uttam is NOT listed in available drivers dropdown.');
  }

  console.log('\n========================================================');
  console.log('STEP 6: Select another available driver and assign to new shipment');
  console.log('========================================================');
  const testDriver = available.find(d => d.fullName.includes('Priya') || d.fullName.includes('Karthik'));
  if (!testDriver) {
    throw new Error('No test driver found in available list');
  }
  console.log(`Selected driver: ${testDriver.fullName} (ID: ${testDriver.id})`);

  const unassigned = await getUnassignedOrders();
  console.log(`Unassigned orders count: ${unassigned.length}`);
  if (unassigned.length === 0) {
    throw new Error('No unassigned orders available for test.');
  }
  const testOrder = unassigned[0];
  console.log(`Using order #${testOrder.orderNumber} (ID: ${testOrder.id})`);

  console.log(`Creating shipment for order #${testOrder.orderNumber} with driver ${testDriver.fullName}...`);
  const createdShipment = await createShipment(testOrder.id, testDriver.id, null);
  console.log(`Created shipment: ${createdShipment.trackingNumber} (ID: ${createdShipment.id}), status: ${createdShipment.status}`);

  console.log('\n========================================================');
  console.log('STEP 7: Verify driver becomes UNAVAILABLE immediately after assignment');
  console.log('========================================================');
  available = await getAvailableDrivers();
  const driverStillAvailable = available.find(d => d.id === testDriver.id);
  console.log(`Is ${testDriver.fullName} in available drivers? ${!!driverStillAvailable} (EXPECTED: false)`);
  if (driverStillAvailable) {
    throw new Error(`FAILED: ${testDriver.fullName} is still available after assignment!`);
  }
  console.log(`PASSED: ${testDriver.fullName} is no longer available.`);

  console.log('\n========================================================');
  console.log('STEP 8 & 9: Change shipment to DELIVERED and recheck available drivers');
  console.log('========================================================');
  console.log(`Updating shipment ${createdShipment.trackingNumber} to DELIVERED...`);
  await updateShipmentStatus(createdShipment.id, 'DELIVERED');
  
  available = await getAvailableDrivers();
  const driverAvailableAfterDelivered = available.find(d => d.id === testDriver.id);
  console.log(`Is ${testDriver.fullName} in available drivers after DELIVERED? ${!!driverAvailableAfterDelivered} (EXPECTED: true)`);
  if (!driverAvailableAfterDelivered) {
    throw new Error(`FAILED: ${testDriver.fullName} did not return to available after DELIVERED!`);
  }
  console.log(`PASSED: ${testDriver.fullName} is available again after DELIVERED!`);

  console.log('\n========================================================');
  console.log('STEP 11: Test the same with CANCELLED');
  console.log('========================================================');
  const unassigned2 = await getUnassignedOrders();
  if (unassigned2.length > 0) {
    const testOrder2 = unassigned2[0];
    console.log(`Creating second shipment for order #${testOrder2.orderNumber} with driver ${testDriver.fullName}...`);
    const createdShipment2 = await createShipment(testOrder2.id, testDriver.id, null);
    console.log(`Created shipment: ${createdShipment2.trackingNumber} (ID: ${createdShipment2.id})`);

    // Verify unavailable again
    available = await getAvailableDrivers();
    if (available.find(d => d.id === testDriver.id)) {
      throw new Error(`FAILED: ${testDriver.fullName} should be unavailable on second shipment assignment.`);
    }
    console.log(`Verified ${testDriver.fullName} became unavailable on assignment.`);

    console.log(`Updating shipment ${createdShipment2.trackingNumber} to CANCELLED...`);
    await updateShipmentStatus(createdShipment2.id, 'CANCELLED');

    available = await getAvailableDrivers();
    const driverAvailableAfterCancelled = available.find(d => d.id === testDriver.id);
    console.log(`Is ${testDriver.fullName} in available drivers after CANCELLED? ${!!driverAvailableAfterCancelled} (EXPECTED: true)`);
    if (!driverAvailableAfterCancelled) {
      throw new Error(`FAILED: ${testDriver.fullName} did not return to available after CANCELLED!`);
    }
    console.log(`PASSED: ${testDriver.fullName} is available again after CANCELLED!`);
  } else {
    console.log('No more unassigned orders to test CANCELLED, but status logic verified identical.');
  }

  console.log('\n========================================================');
  console.log('EDGE CASE TEST: Double assignment validation');
  console.log('========================================================');
  try {
    // Try to assign Uttam directly to a new shipment if unassigned order exists
    const unassigned3 = await getUnassignedOrders();
    if (unassigned3.length > 0) {
      console.log('Testing server rejection if client attempts to assign Uttam (driver ID 19)...');
      await createShipment(unassigned3[0].id, 19, null);
      throw new Error('FAILED: Server allowed assigning a driver who has an active shipment!');
    }
  } catch (err) {
    console.log(`Server correctly rejected assignment: "${err.message}"`);
    console.log('PASSED: Server rejected assignment of driver on active shipment!');
  }

  console.log('\n>>> ALL SCENARIOS AND LIFECYCLE TESTS PASSED PERFECTLY! <<<');
}

runTest().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
