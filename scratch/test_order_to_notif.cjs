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

async function run() {
  console.log('=== TEST CREATING REAL CUSTOMER ORDER & CHECKING WAREHOUSE NOTIFICATION ===');
  const custToken = await login('customer@primeroute.com', 'Customer@2026!');
  const wmToken = await login('priya@primeroute.com', 'Manager@2026!');

  // Check unread count before order
  const countBefore = await request('GET', '/api/warehouse-manager/notifications/unread-count', { Authorization: `Bearer ${wmToken}` });
  const initialUnread = countBefore.body?.data?.unreadCount || 0;
  console.log('Initial WM unread count:', initialUnread);

  // Get or create addresses for customer
  let addresses = await request('GET', '/api/customer/addresses', { Authorization: `Bearer ${custToken}` });
  let addrList = addresses.body?.data || addresses.body || [];
  
  let pickupAddrId = null;
  let delivAddrId = null;

  if (Array.isArray(addrList) && addrList.length >= 2) {
    pickupAddrId = addrList[0].id;
    delivAddrId = addrList[1].id;
  } else {
    const addr1 = await request('POST', '/api/customer/addresses', { Authorization: `Bearer ${custToken}` }, {
      label: 'BLR Warehouse Pickup Point',
      addressLine1: 'Indiranagar 100ft Road',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'India',
      isDefault: true
    });
    pickupAddrId = addr1.body?.data?.id || addr1.body?.id;

    const addr2 = await request('POST', '/api/customer/addresses', { Authorization: `Bearer ${custToken}` }, {
      label: 'Kolkata Hub Drop',
      addressLine1: 'Netaji Subhas Road',
      city: 'Kolkata',
      state: 'West Bengal',
      postalCode: '700001',
      country: 'India',
      isDefault: false
    });
    delivAddrId = addr2.body?.data?.id || addr2.body?.id;
  }

  console.log(`Using pickupAddressId=${pickupAddrId}, deliveryAddressId=${delivAddrId}`);

  // Create Order
  const orderRes = await request('POST', '/api/customer/orders', { Authorization: `Bearer ${custToken}` }, {
    pickupAddressId: pickupAddrId,
    deliveryAddressId: delivAddrId,
    deliveryType: 'STANDARD',
    paymentMethod: 'CREDIT_CARD',
    packageDescription: 'Precision Tools & Components',
    packageWeight: 2.5,
    packageQuantity: 1,
    items: [
      {
        productId: 1,
        quantity: 1
      }
    ]
  });

  console.log('Order create status:', orderRes.status);
  const createdOrder = orderRes.body?.data || orderRes.body;
  console.log('Created Order:', createdOrder?.orderNumber);

  // Check Warehouse Manager Notifications now
  const notifsAfter = await request('GET', '/api/warehouse-manager/notifications', { Authorization: `Bearer ${wmToken}` });
  const countAfter = await request('GET', '/api/warehouse-manager/notifications/unread-count', { Authorization: `Bearer ${wmToken}` });

  console.log('\nWarehouse Manager Unread Count NOW:', countAfter.body?.data?.unreadCount);
  console.log('Latest Warehouse Manager Notification:');
  console.log(notifsAfter.body?.data?.[0]);

  // Test Mark As Read on this new notification
  const latestId = notifsAfter.body?.data?.[0]?.id;
  if (latestId) {
    console.log(`\nMarking notification #${latestId} as read...`);
    const readRes = await request('PATCH', `/api/warehouse-manager/notifications/${latestId}/read`, { Authorization: `Bearer ${wmToken}` });
    console.log('Mark read status:', readRes.status);

    const countFinal = await request('GET', '/api/warehouse-manager/notifications/unread-count', { Authorization: `Bearer ${wmToken}` });
    console.log('WM unread count after marking 1 read:', countFinal.body?.data?.unreadCount);
  }
}

run().catch(console.error);
