const assert = require('assert');

async function runVerification() {
  console.log('====================================================');
  console.log('PRIMEROUTE DRIVER PORTAL D8 — INTEGRATION VERIFICATION');
  console.log('====================================================\n');

  // ── 1. Authenticate Driver A (Ramesh Kumar) ──
  console.log('1. Authenticating Driver A (Ramesh Kumar)...');
  const loginResA = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ramesh@primeroute.com', password: 'Driver@2026!' }),
  });
  assert.strictEqual(loginResA.status, 200, 'Driver A login should succeed');
  const loginDataA = await loginResA.json();
  const tokenA = loginDataA.data?.token || loginDataA.token;
  console.log('   ✓ Driver A authenticated as:', loginDataA.fullName, 'Role:', loginDataA.role);

  // ── 2. Authenticate Driver B (Priya Patel) ──
  console.log('\n2. Authenticating Driver B (Priya Patel)...');
  const loginResB = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'priya.patel@primeroute.in', password: 'Driver@2026!' }),
  });
  assert.strictEqual(loginResB.status, 200, 'Driver B login should succeed');
  const loginDataB = await loginResB.json();
  const tokenB = loginDataB.data?.token || loginDataB.token;
  console.log('   ✓ Driver B authenticated as:', loginDataB.fullName, 'Role:', loginDataB.role);

  // ── 3. Register & Authenticate Customer (for 403 verification) ──
  console.log('\n3. Registering & Authenticating Test Customer...');
  const testCustEmail = `test.cust.d8.${Date.now()}@primeroute.com`;
  const regRes = await fetch('http://localhost:8080/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Test Customer',
      email: testCustEmail,
      password: 'Customer@2026!',
      phone: '9876543210',
    }),
  });
  assert(regRes.status === 200 || regRes.status === 201, 'Customer registration should succeed');

  const loginResCust = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testCustEmail, password: 'Customer@2026!' }),
  });
  assert.strictEqual(loginResCust.status, 200, 'Customer login should succeed');
  const loginDataCust = await loginResCust.json();
  const tokenCust = loginDataCust.data?.token || loginDataCust.token;
  console.log('   ✓ Customer authenticated as:', loginDataCust.fullName, 'Role:', loginDataCust.role);

  // ── 4. Verify Driver A Profile from JWT Principal ──
  console.log('\n4. Verifying Driver A Profile (/api/driver/me)...');
  const profResA = await fetch('http://localhost:8080/api/driver/me', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert.strictEqual(profResA.status, 200, 'Driver A profile request should succeed');
  const profA = (await profResA.json()).data;
  console.log('   ✓ Name:', profA.fullName);
  console.log('   ✓ Driver ID:', profA.driverId);
  console.log('   ✓ Warehouse:', profA.assignedWarehouseName);
  console.log('   ✓ License Number:', profA.licenseNumber);
  console.log('   ✓ Vehicle:', profA.assignedVehiclePlate, `(${profA.assignedVehicleModel})`);
  assert.strictEqual(profA.fullName, 'Ramesh Kumar');
  assert.strictEqual(profA.driverId, 'DRV-020');
  assert.strictEqual(profA.assignedWarehouseName, 'Bengaluru Central Hub');

  // ── 5. Verify Driver B Profile from JWT Principal (Driver Isolation) ──
  console.log('\n5. Verifying Driver B Profile (/api/driver/me)...');
  const profResB = await fetch('http://localhost:8080/api/driver/me', {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  assert.strictEqual(profResB.status, 200, 'Driver B profile request should succeed');
  const profB = (await profResB.json()).data;
  console.log('   ✓ Name:', profB.fullName);
  console.log('   ✓ Driver ID:', profB.driverId);
  console.log('   ✓ Warehouse:', profB.assignedWarehouseName);
  console.log('   ✓ Vehicle:', profB.assignedVehiclePlate, `(${profB.assignedVehicleModel})`);
  assert.strictEqual(profB.fullName, 'Priya Patel');
  assert.strictEqual(profB.driverId, 'DRV-013');
  assert.strictEqual(profB.assignedWarehouseName, 'Kolkata Eastern Corridor Hub');

  // ── 6. Verify Driver Notifications (/api/driver/notifications) ──
  console.log('\n6. Verifying Driver Notifications (/api/driver/notifications)...');
  const notifsRes = await fetch('http://localhost:8080/api/driver/notifications', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert.strictEqual(notifsRes.status, 200, 'Driver notification request should return 200');
  const notifsA = (await notifsRes.json()).data;
  console.log(`   ✓ Found ${notifsA.length} database notifications for Driver A`);

  const unreadCountRes = await fetch('http://localhost:8080/api/driver/notifications/unread-count', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert.strictEqual(unreadCountRes.status, 200, 'Driver unread count request should return 200');
  const unreadA = (await unreadCountRes.json()).data;
  console.log('   ✓ Driver A unread notification count:', unreadA.unreadCount);

  // ── 7. Verify Support Contact & Tickets ──
  console.log('\n7. Verifying Driver Support Hotline & Tickets...');
  const contactRes = await fetch('http://localhost:8080/api/customer/support/contact', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert.strictEqual(contactRes.status, 200, 'Support contact endpoint should return 200');
  const contact = (await contactRes.json()).data;
  console.log('   ✓ Support Hotline Phone:', contact.supportPhone);
  console.log('   ✓ Support Hours:', contact.supportHours);
  console.log('   ✓ Support Email:', contact.supportEmail);
  assert(contact.supportPhone, 'Support phone must be non-empty');

  const ticketsRes = await fetch('http://localhost:8080/api/customer/support/tickets', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert.strictEqual(ticketsRes.status, 200, 'Driver support tickets request should return 200');
  const ticketsList = (await ticketsRes.json()).data;
  console.log(`   ✓ Driver A has ${ticketsList.length} persisted support tickets`);
  if (ticketsList.length > 0) {
    console.log('   ✓ Sample ticket:', ticketsList[0].ticketNumber, 'Subject:', ticketsList[0].subject, 'Status:', ticketsList[0].status);
  }

  // ── 8. Security Matrix: 401 & 403 Checks ──
  console.log('\n8. Verifying Security & Authorization Matrix...');

  // Unauthenticated -> 401
  const unauthRes = await fetch('http://localhost:8080/api/driver/me');
  console.log('   ✓ Unauthenticated /api/driver/me status:', unauthRes.status, '(Expected: 401)');
  assert.strictEqual(unauthRes.status, 401);

  // Customer attempting Driver API -> 403
  const custOnDriverRes = await fetch('http://localhost:8080/api/driver/me', {
    headers: { Authorization: `Bearer ${tokenCust}` },
  });
  console.log('   ✓ Customer accessing /api/driver/me status:', custOnDriverRes.status, '(Expected: 403)');
  assert.strictEqual(custOnDriverRes.status, 403);

  // Driver attempting Customer Notifications -> 403
  const driverOnCustNotifRes = await fetch('http://localhost:8080/api/customer/notifications', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  console.log('   ✓ Driver accessing /api/customer/notifications status:', driverOnCustNotifRes.status, '(Expected: 403)');
  assert.strictEqual(driverOnCustNotifRes.status, 403);

  // Driver attempting Admin API -> 403
  const driverOnAdminRes = await fetch('http://localhost:8080/api/admin/drivers', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  console.log('   ✓ Driver accessing /api/admin/drivers status:', driverOnAdminRes.status, '(Expected: 403)');
  assert.strictEqual(driverOnAdminRes.status, 403);

  console.log('\n====================================================');
  console.log('ALL DRIVER PORTAL D8 CHECKS PASSED PERFECTLY!');
  console.log('====================================================\n');
}

runVerification().catch((err) => {
  console.error('\n❌ Verification failed:', err);
  process.exit(1);
});
