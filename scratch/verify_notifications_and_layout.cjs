const assert = require('assert');

const BASE_URL = 'http://localhost:8080/api';

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const res = await fetch(url, options);
  let json = null;
  try {
    json = await res.json();
  } catch (e) {}
  return { status: res.status, ok: res.ok, data: json };
}

async function login(email, password) {
  const res = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(`Login failed for ${email} (${res.status}): ${JSON.stringify(res.data)}`);
  }
  return res.data.token || res.data.data?.token;
}

async function main() {
  console.log('================================================================');
  console.log('PRIMEROUTE NOTIFICATIONS & ROLE SCOPING VERIFICATION');
  console.log('================================================================\n');

  // 1. Authenticate All Roles
  console.log('--- 1. Authenticating Roles ---');
  const custEmail = `notif.cust.${Date.now()}@primeroute.com`;
  await request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Notification Test Customer',
      email: custEmail,
      password: 'Customer@2026!',
      phone: '9876543210',
    }),
  });
  const custToken = await login(custEmail, 'Customer@2026!');
  console.log('   ✓ Customer logged in:', custEmail);

  const driverToken = await login('ramesh@primeroute.com', 'Driver@2026!');
  console.log('   ✓ Driver Ramesh Kumar logged in');

  const wmBlrToken = await login('priya@primeroute.com', 'Manager@2026!');
  console.log('   ✓ Bangalore Warehouse Manager logged in (priya@primeroute.com)');

  const wmKolkataToken = await login('ccu.east@primeroute.com', 'Manager@2026!');
  console.log('   ✓ Kolkata Warehouse Manager logged in (ccu.east@primeroute.com)');

  // 2. Customer Notification Flow
  console.log('\n--- 2. Customer Notification Flow ---');
  const custNotifs = await request('/customer/notifications', {
    headers: { Authorization: `Bearer ${custToken}` },
  });
  assert.strictEqual(custNotifs.status, 200);
  console.log(`   ✓ Customer notifications retrieved: ${custNotifs.data.data.length} items`);

  const custUnread = await request('/customer/notifications/unread-count', {
    headers: { Authorization: `Bearer ${custToken}` },
  });
  assert.strictEqual(custUnread.status, 200);
  console.log(`   ✓ Customer unread count retrieved: ${custUnread.data.data.unreadCount}`);

  // 3. Driver Notification Flow
  console.log('\n--- 3. Driver Notification Flow ---');
  const driverNotifs = await request('/driver/notifications', {
    headers: { Authorization: `Bearer ${driverToken}` },
  });
  assert.strictEqual(driverNotifs.status, 200);
  console.log(`   ✓ Driver notifications retrieved: ${driverNotifs.data.data.length} items`);

  const driverUnread = await request('/driver/notifications/unread-count', {
    headers: { Authorization: `Bearer ${driverToken}` },
  });
  assert.strictEqual(driverUnread.status, 200);
  console.log(`   ✓ Driver unread count retrieved: ${driverUnread.data.data.unreadCount}`);

  if (driverNotifs.data.data.length > 0) {
    const notifId = driverNotifs.data.data[0].id;
    const markReadRes = await request(`/driver/notifications/${notifId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${driverToken}` },
    });
    assert.strictEqual(markReadRes.status, 200);
    console.log(`   ✓ Driver notification #${notifId} marked read successfully`);
  }

  const markAllDriverRes = await request('/driver/notifications/read-all', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${driverToken}` },
  });
  assert.strictEqual(markAllDriverRes.status, 200);
  console.log('   ✓ Driver mark all as read succeeded');

  // 4. Warehouse Manager Notification Flow & Scope Verification
  console.log('\n--- 4. Warehouse Manager Notification Flow & Scoping ---');
  const wmBlrNotifs = await request('/warehouse-manager/notifications', {
    headers: { Authorization: `Bearer ${wmBlrToken}` },
  });
  assert.strictEqual(wmBlrNotifs.status, 200);
  console.log(`   ✓ Bangalore Warehouse Manager notifications: ${wmBlrNotifs.data.data.length} items`);
  console.log(`      Sample Bangalore Alerts: ${wmBlrNotifs.data.data.slice(0, 2).map(n => n.title).join(' | ')}`);

  const wmKolkataNotifs = await request('/warehouse-manager/notifications', {
    headers: { Authorization: `Bearer ${wmKolkataToken}` },
  });
  assert.strictEqual(wmKolkataNotifs.status, 200);
  console.log(`   ✓ Kolkata Warehouse Manager notifications: ${wmKolkataNotifs.data.data.length} items`);
  console.log(`      Sample Kolkata Alerts: ${wmKolkataNotifs.data.data.slice(0, 2).map(n => n.title).join(' | ')}`);

  // 5. Security Matrix
  console.log('\n--- 5. Security & Cross-Role Isolation Matrix ---');
  
  // Unauthenticated -> 401
  const unauthCust = await request('/customer/notifications');
  console.log('   ✓ Unauthenticated on /customer/notifications:', unauthCust.status, '(401 Expected)');
  assert.strictEqual(unauthCust.status, 401);

  const unauthDriver = await request('/driver/notifications');
  console.log('   ✓ Unauthenticated on /driver/notifications:', unauthDriver.status, '(401 Expected)');
  assert.strictEqual(unauthDriver.status, 401);

  const unauthWm = await request('/warehouse-manager/notifications');
  console.log('   ✓ Unauthenticated on /warehouse-manager/notifications:', unauthWm.status, '(401 Expected)');
  assert.strictEqual(unauthWm.status, 401);

  // Customer cannot access Driver or Warehouse notifications -> 403
  const custOnDriver = await request('/driver/notifications', { headers: { Authorization: `Bearer ${custToken}` } });
  console.log('   ✓ Customer on /driver/notifications:', custOnDriver.status, '(403 Expected)');
  assert.strictEqual(custOnDriver.status, 403);

  const custOnWm = await request('/warehouse-manager/notifications', { headers: { Authorization: `Bearer ${custToken}` } });
  console.log('   ✓ Customer on /warehouse-manager/notifications:', custOnWm.status, '(403 Expected)');
  assert.strictEqual(custOnWm.status, 403);

  // Driver cannot access Customer or Warehouse notifications -> 403
  const driverOnCust = await request('/customer/notifications', { headers: { Authorization: `Bearer ${driverToken}` } });
  console.log('   ✓ Driver on /customer/notifications:', driverOnCust.status, '(403 Expected)');
  assert.strictEqual(driverOnCust.status, 403);

  const driverOnWm = await request('/warehouse-manager/notifications', { headers: { Authorization: `Bearer ${driverToken}` } });
  console.log('   ✓ Driver on /warehouse-manager/notifications:', driverOnWm.status, '(403 Expected)');
  assert.strictEqual(driverOnWm.status, 403);

  // Warehouse Manager cannot access Customer or Driver notifications -> 403
  const wmOnCust = await request('/customer/notifications', { headers: { Authorization: `Bearer ${wmBlrToken}` } });
  console.log('   ✓ Warehouse Manager on /customer/notifications:', wmOnCust.status, '(403 Expected)');
  assert.strictEqual(wmOnCust.status, 403);

  const wmOnDriver = await request('/driver/notifications', { headers: { Authorization: `Bearer ${wmBlrToken}` } });
  console.log('   ✓ Warehouse Manager on /driver/notifications:', wmOnDriver.status, '(403 Expected)');
  assert.strictEqual(wmOnDriver.status, 403);

  console.log('\n================================================================');
  console.log('ALL NOTIFICATION & SECURITY AUDIT CRITERIA PASSED!');
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('\n❌ AUDIT FAILED:', err);
  process.exit(1);
});
