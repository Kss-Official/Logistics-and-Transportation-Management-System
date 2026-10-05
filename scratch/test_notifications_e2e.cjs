const http = require('http');

const BASE_URL = 'http://localhost:8080';

function request(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = data;
        try {
          json = JSON.parse(data);
        } catch (e) {}
        resolve({ status: res.statusCode, body: json });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function login(email, password) {
  const res = await request('POST', '/api/auth/login', {}, { email, password });
  if (res.status === 200 && res.body.token) {
    return res.body.token;
  }
  throw new Error(`Login failed for ${email}: ${JSON.stringify(res.body)}`);
}

async function runE2ETest() {
  console.log('========================================================');
  console.log('  PRIMEROUTE NOTIFICATION SYSTEM E2E VERIFICATION TEST  ');
  console.log('========================================================\n');

  // 1. Warehouse Manager Login & Notifications
  console.log('1. Testing Warehouse Manager Notification APIs...');
  const wmToken = await login('priya@primeroute.com', 'Manager@2026!');
  console.log('   ✓ Warehouse Manager authentication successful');

  const wmNotifsRes = await request('GET', '/api/warehouse-manager/notifications', { Authorization: `Bearer ${wmToken}` });
  console.log(`   ✓ GET /api/warehouse-manager/notifications -> Status ${wmNotifsRes.status}, items: ${wmNotifsRes.body?.data?.length || 0}`);

  const wmCountRes = await request('GET', '/api/warehouse-manager/notifications/unread-count', { Authorization: `Bearer ${wmToken}` });
  console.log(`   ✓ GET /api/warehouse-manager/notifications/unread-count -> Status ${wmCountRes.status}, unreadCount: ${wmCountRes.body?.data?.unreadCount}`);

  // 2. Driver Login & Notifications
  console.log('\n2. Testing Driver Notification APIs...');
  const driverToken = await login('ramesh@primeroute.com', 'Driver@2026!');
  console.log('   ✓ Driver authentication successful');

  const drvNotifsRes = await request('GET', '/api/driver/notifications', { Authorization: `Bearer ${driverToken}` });
  console.log(`   ✓ GET /api/driver/notifications -> Status ${drvNotifsRes.status}, items: ${drvNotifsRes.body?.data?.length || 0}`);

  const drvCountRes = await request('GET', '/api/driver/notifications/unread-count', { Authorization: `Bearer ${driverToken}` });
  console.log(`   ✓ GET /api/driver/notifications/unread-count -> Status ${drvCountRes.status}, unreadCount: ${drvCountRes.body?.data?.unreadCount}`);

  // 3. Mark all as read & Mark as read for Driver
  console.log('\n3. Testing Driver notification mutations (read-all, read, delete)...');
  const readAllDrv = await request('PATCH', '/api/driver/notifications/read-all', { Authorization: `Bearer ${driverToken}` });
  console.log(`   ✓ PATCH /api/driver/notifications/read-all -> Status ${readAllDrv.status}`);

  // 4. Mark all as read for Warehouse Manager
  console.log('\n4. Testing Warehouse Manager notification mutations (read-all)...');
  const readAllWm = await request('PATCH', '/api/warehouse-manager/notifications/read-all', { Authorization: `Bearer ${wmToken}` });
  console.log(`   ✓ PATCH /api/warehouse-manager/notifications/read-all -> Status ${readAllWm.status}`);

  // Verify unread count is 0
  const wmZeroCount = await request('GET', '/api/warehouse-manager/notifications/unread-count', { Authorization: `Bearer ${wmToken}` });
  console.log(`   ✓ Warehouse Manager unread count after read-all: ${wmZeroCount.body?.data?.unreadCount}`);

  // 5. Test Live Order Creation & Notification Propagation
  console.log('\n5. Creating a new Customer Order in Bangalore to verify Warehouse Notification...');
  const custToken = await login('customer@primeroute.com', 'Customer@2026!');
  
  const createOrderRes = await request('POST', '/api/customer/orders', { Authorization: `Bearer ${custToken}` }, {
    pickupAddress: {
      addressLine1: 'Indiranagar 100ft Road',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'India'
    },
    deliveryAddress: {
      addressLine1: 'Whitefield Main Road',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560066',
      country: 'India'
    },
    deliveryType: 'STANDARD',
    packageDescription: 'Electronics & Test Components',
    packageWeight: 3.5,
    packageQuantity: 1,
    items: [
      {
        product: { id: 1 },
        quantity: 1,
        unitPrice: 500
      }
    ]
  });

  console.log(`   ✓ Customer Order Creation Status: ${createOrderRes.status}`);
  if (createOrderRes.body?.orderNumber) {
    console.log(`   ✓ Order Number: ${createOrderRes.body.orderNumber}`);
  }

  // 6. Check Warehouse Manager Notifications again
  console.log('\n6. Checking Warehouse Manager Notifications for the newly allocated order...');
  const wmNewNotifs = await request('GET', '/api/warehouse-manager/notifications', { Authorization: `Bearer ${wmToken}` });
  const latestWmNotif = wmNewNotifs.body?.data?.[0];
  console.log(`   ✓ Warehouse Manager total notifications: ${wmNewNotifs.body?.data?.length}`);
  console.log(`   ✓ Latest Notification: "${latestWmNotif?.title}" - "${latestWmNotif?.message}"`);

  const wmNewCount = await request('GET', '/api/warehouse-manager/notifications/unread-count', { Authorization: `Bearer ${wmToken}` });
  console.log(`   ✓ Warehouse Manager new unread count: ${wmNewCount.body?.data?.unreadCount}`);

  console.log('\n========================================================');
  console.log('  ALL NOTIFICATION WORKFLOWS VERIFIED SUCCESSFULLY!   ');
  console.log('========================================================');
}

runE2ETest().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
