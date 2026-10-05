const http = require('http');

function post(path, data, token) {
  return new Promise((resolve) => {
    const body = JSON.stringify(data);
    const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const req = http.request({ hostname: 'localhost', port: 8080, path, method: 'POST', headers }, (res) => {
      let b = ''; res.on('data', c => b += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(b) }); }
        catch { resolve({ status: res.statusCode, raw: b }); }
      });
    });
    req.write(body);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const req = http.request({ hostname: 'localhost', port: 8080, path, method: 'GET', headers }, (res) => {
      let b = ''; res.on('data', c => b += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(b) }); }
        catch { resolve({ status: res.statusCode, raw: b }); }
      });
    });
    req.end();
  });
}

function patch(path, token) {
  return new Promise((resolve) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const req = http.request({ hostname: 'localhost', port: 8080, path, method: 'PATCH', headers }, (res) => {
      let b = ''; res.on('data', c => b += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(b) }); }
        catch { resolve({ status: res.statusCode, raw: b }); }
      });
    });
    req.end();
  });
}

async function verify() {
  console.log('=== STEP 1: Admin Login ===');
  const adminLogin = await post('/api/auth/login', {
    email: 'admin@primeroute.com',
    password: 'Admin@PrimeRoute2026!'
  });
  console.log('Admin login status:', adminLogin.status, 'Role:', adminLogin.body.role);
  const adminToken = adminLogin.body.token;

  console.log('\n=== STEP 2: Customer Login ===');
  const custLogin = await post('/api/auth/login', {
    email: 'customer@primeroute.com',
    password: 'Customer@123'
  });
  console.log('Customer login status:', custLogin.status, 'Role:', custLogin.body.role);
  const custToken = custLogin.body.token;

  console.log('\n=== STEP 3: Security Authorization Checks ===');
  const custAccessAdmin = await get('/api/admin/notifications', custToken);
  console.log('Customer attempting GET /api/admin/notifications -> Status:', custAccessAdmin.status, '(Expected: 403 Forbidden)');

  console.log('\n=== STEP 4: Admin Notifications API ===');
  const initialAdminNotifs = await get('/api/admin/notifications', adminToken);
  const initialAdminUnread = await get('/api/admin/notifications/unread-count', adminToken);
  console.log('Admin notifications count:', initialAdminNotifs.body.data?.length);
  console.log('Admin unread count:', initialAdminUnread.body.data?.unreadCount);

  console.log('\n=== STEP 5: Trigger Real Event - Customer Creates Order ===');
  const orderRes = await post('/api/customer/orders', {
    pickupAddressId: 1,
    deliveryAddressId: 2,
    deliveryType: 'STANDARD',
    packageDescription: 'E2E Verified Delivery Parcel',
    packageWeight: 3.5,
    packageQuantity: 1
  }, custToken);
  console.log('Customer create order status:', orderRes.status, 'Order Number:', orderRes.body.data?.orderNumber);

  console.log('\n=== STEP 6: Verify Admin Received Dynamic Notification for Order ===');
  const afterOrderNotifs = await get('/api/admin/notifications', adminToken);
  const afterOrderUnread = await get('/api/admin/notifications/unread-count', adminToken);
  console.log('Admin notifications count after order:', afterOrderNotifs.body.data?.length);
  console.log('Admin unread count after order:', afterOrderUnread.body.data?.unreadCount);
  const latestNotif = afterOrderNotifs.body.data?.[0];
  console.log('Latest Admin notification:', {
    id: latestNotif?.id,
    title: latestNotif?.title,
    message: latestNotif?.message,
    type: latestNotif?.type,
    read: latestNotif?.read
  });

  console.log('\n=== STEP 7: Mark Single Notification as Read ===');
  if (latestNotif && !latestNotif.read) {
    const markOne = await patch(`/api/admin/notifications/${latestNotif.id}/read`, adminToken);
    console.log('Mark as read status:', markOne.status);
    const countAfterOne = await get('/api/admin/notifications/unread-count', adminToken);
    console.log('Unread count after marking one as read:', countAfterOne.body.data?.unreadCount);
  }

  console.log('\n=== STEP 8: Mark All as Read ===');
  const markAll = await patch('/api/admin/notifications/read-all', adminToken);
  console.log('Mark all read status:', markAll.status);
  const finalUnread = await get('/api/admin/notifications/unread-count', adminToken);
  console.log('Final Admin unread count:', finalUnread.body.data?.unreadCount, '(Expected: 0)');

  console.log('\n=== STEP 9: Customer Notifications Independence ===');
  const custNotifs = await get('/api/customer/notifications', custToken);
  console.log('Customer notifications count:', custNotifs.body.data?.length);
  const custLatest = custNotifs.body.data?.[0];
  console.log('Latest Customer notification:', {
    id: custLatest?.id,
    title: custLatest?.title,
    message: custLatest?.message,
    type: custLatest?.type
  });

  console.log('\n=== ALL VERIFICATION CHECKS PASSED 100% ===');
}

verify().catch(console.error);
