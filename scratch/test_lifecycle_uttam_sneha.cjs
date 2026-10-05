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
const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

async function updateShipmentStatus(id, status) {
  const res = await fetch(`http://localhost:8080/api/admin/shipments/${id}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      status,
      locationName: 'Destination Hub',
      description: `Transitioned to ${status}`
    })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `Failed to update status to ${status}`);
  return json.data;
}

async function getAllDrivers() {
  const res = await fetch('http://localhost:8080/api/admin/drivers', { headers });
  const json = await res.json();
  return json.data || [];
}

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

async function createShipment(orderId, driverId) {
  const res = await fetch('http://localhost:8080/api/admin/shipments', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      orderId,
      driverId,
      initialLocation: 'Central Dispatch Hub'
    })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to create shipment');
  return json.data;
}

async function run() {
  console.log('===============================================================');
  console.log('STEP 1: Deliver Uttam current shipment TRK-PR-KT455SFX (ID: 20)');
  console.log('===============================================================');
  await updateShipmentStatus(20, 'DELIVERED');
  console.log('Shipment 20 marked DELIVERED.');

  let all = await getAllDrivers();
  let uttam = all.find(d => d.id === 19);
  console.log(`Drivers Page -> Uttam: Status = ${uttam.status}, Active Shipments = ${uttam.assignedShipmentsCount}`);
  if (uttam.status !== 'AVAILABLE' || uttam.assignedShipmentsCount !== 0) {
    throw new Error(`FAIL: Uttam should be AVAILABLE with 0 active shipments, got ${uttam.status}, ${uttam.assignedShipmentsCount}`);
  }
  console.log('PASSED: Drivers Page shows Uttam as Available with 0 active shipments!');

  let avail = await getAvailableDrivers();
  let uttamAvail = avail.find(d => d.id === 19);
  console.log(`Create Shipment -> Is Uttam in available drivers? ${!!uttamAvail}`);
  if (!uttamAvail) {
    throw new Error('FAIL: Uttam must appear in available drivers list when status is AVAILABLE!');
  }
  console.log(`PASSED: Uttam is listed in Create Shipment dropdown: "${uttamAvail.fullName} — ${uttamAvail.phone} — ${uttamAvail.licenseNumber}"`);

  console.log('\n===============================================================');
  console.log('STEP 2: Deliver Sneha current shipment TRK-PR-EHNJFD4C (ID: 18)');
  console.log('===============================================================');
  await updateShipmentStatus(18, 'DELIVERED');
  console.log('Shipment 18 marked DELIVERED.');

  all = await getAllDrivers();
  let sneha = all.find(d => d.id === 16);
  console.log(`Drivers Page -> Sneha: Status = ${sneha.status}, Active Shipments = ${sneha.assignedShipmentsCount}`);
  if (sneha.status !== 'AVAILABLE' || sneha.assignedShipmentsCount !== 0) {
    throw new Error(`FAIL: Sneha should be AVAILABLE with 0 active shipments, got ${sneha.status}, ${sneha.assignedShipmentsCount}`);
  }
  console.log('PASSED: Drivers Page shows Sneha as Available with 0 active shipments!');

  avail = await getAvailableDrivers();
  let snehaAvail = avail.find(d => d.id === 16);
  console.log(`Create Shipment -> Is Sneha in available drivers? ${!!snehaAvail}`);
  if (!snehaAvail) {
    throw new Error('FAIL: Sneha must appear in available drivers list when status is AVAILABLE!');
  }
  console.log(`PASSED: Sneha is listed in Create Shipment dropdown: "${snehaAvail.fullName} — ${snehaAvail.phone} — ${snehaAvail.licenseNumber}"`);

  console.log('\n===============================================================');
  console.log('STEP 3: Assign Uttam to a new shipment and verify immediate lock');
  console.log('===============================================================');
  const unassigned = await getUnassignedOrders();
  if (unassigned.length === 0) throw new Error('No unassigned orders found for test');
  const testOrder = unassigned[0];
  console.log(`Creating shipment for order #${testOrder.orderNumber} with driver Uttam (ID: 19)...`);
  const newShipment = await createShipment(testOrder.id, 19);
  console.log(`Dispatched new shipment: ${newShipment.trackingNumber} (ID: ${newShipment.id})`);

  all = await getAllDrivers();
  uttam = all.find(d => d.id === 19);
  console.log(`Drivers Page -> Uttam: Status = ${uttam.status}, Active Shipments = ${uttam.assignedShipmentsCount}`);
  if (uttam.status !== 'ON_TRIP' || uttam.assignedShipmentsCount !== 1) {
    throw new Error(`FAIL: Uttam should be ON_TRIP with 1 active shipment, got ${uttam.status}, ${uttam.assignedShipmentsCount}`);
  }
  console.log('PASSED: Drivers Page shows Uttam as On Trip with 1 active shipment!');

  avail = await getAvailableDrivers();
  uttamAvail = avail.find(d => d.id === 19);
  console.log(`Create Shipment -> Is Uttam in available drivers? ${!!uttamAvail} (EXPECTED: false)`);
  if (uttamAvail) {
    throw new Error('FAIL: Uttam should NOT appear in available drivers while ON_TRIP!');
  }
  console.log('PASSED: Uttam is immediately removed from available drivers dropdown!');

  console.log('\n===============================================================');
  console.log('STEP 4: Complete new shipment and verify Uttam returns to available');
  console.log('===============================================================');
  console.log(`Updating shipment ${newShipment.trackingNumber} to DELIVERED...`);
  await updateShipmentStatus(newShipment.id, 'DELIVERED');

  all = await getAllDrivers();
  uttam = all.find(d => d.id === 19);
  console.log(`Drivers Page -> Uttam: Status = ${uttam.status}, Active Shipments = ${uttam.assignedShipmentsCount}`);
  if (uttam.status !== 'AVAILABLE' || uttam.assignedShipmentsCount !== 0) {
    throw new Error(`FAIL: Uttam should return to AVAILABLE, got ${uttam.status}, ${uttam.assignedShipmentsCount}`);
  }
  console.log('PASSED: Drivers Page shows Uttam as Available with 0 active shipments!');

  avail = await getAvailableDrivers();
  uttamAvail = avail.find(d => d.id === 19);
  console.log(`Create Shipment -> Is Uttam in available drivers? ${!!uttamAvail} (EXPECTED: true)`);
  if (!uttamAvail) {
    throw new Error('FAIL: Uttam should return to available drivers after DELIVERED!');
  }
  console.log('PASSED: Uttam is available again in Create Shipment dropdown!');

  console.log('\n===============================================================');
  console.log('STEP 5: Repeat lifecycle with CANCELLED for Sneha');
  console.log('===============================================================');
  const unassigned2 = await getUnassignedOrders();
  if (unassigned2.length > 0) {
    const testOrder2 = unassigned2[0];
    console.log(`Creating shipment for order #${testOrder2.orderNumber} with driver Sneha (ID: 16)...`);
    const snehaShipment = await createShipment(testOrder2.id, 16);
    console.log(`Dispatched new shipment: ${snehaShipment.trackingNumber} (ID: ${snehaShipment.id})`);

    // Sneha should now be ON_TRIP and unavailable
    avail = await getAvailableDrivers();
    if (avail.find(d => d.id === 16)) throw new Error('FAIL: Sneha should not be available during active shipment');
    console.log('PASSED: Sneha is removed from available drivers while on trip.');

    // Cancel shipment
    console.log(`Updating shipment ${snehaShipment.trackingNumber} to CANCELLED...`);
    await updateShipmentStatus(snehaShipment.id, 'CANCELLED');

    all = await getAllDrivers();
    sneha = all.find(d => d.id === 16);
    console.log(`Drivers Page -> Sneha: Status = ${sneha.status}, Active Shipments = ${sneha.assignedShipmentsCount}`);
    if (sneha.status !== 'AVAILABLE' || sneha.assignedShipmentsCount !== 0) {
      throw new Error(`FAIL: Sneha should be AVAILABLE after CANCELLED, got ${sneha.status}, ${sneha.assignedShipmentsCount}`);
    }
    console.log('PASSED: Drivers Page shows Sneha as Available with 0 active shipments!');

    avail = await getAvailableDrivers();
    if (!avail.find(d => d.id === 16)) throw new Error('FAIL: Sneha should return to available drivers after CANCELLED');
    console.log('PASSED: Sneha is available again in Create Shipment dropdown after CANCELLED!');
  }

  console.log('\n===============================================================');
  console.log('ALL LIFECYCLE TESTS FOR UTTAM AND SNEHA PASSED 100% SUCCESFULLY!');
  console.log('===============================================================');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
