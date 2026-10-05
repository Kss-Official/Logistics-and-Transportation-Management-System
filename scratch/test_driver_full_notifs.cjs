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

async function testFullDriverNotificationLifecycle() {
  console.log('=== TEST FULL DRIVER NOTIFICATION LIFECYCLE ===');

  const custToken = await login('customer@primeroute.com', 'Customer@2026!');
  const ccuManagerToken = await login('ccu.east@primeroute.com', 'Manager@2026!');
  const driverPriyaToken = await login('priya.patel@primeroute.in', 'Driver@2026!');

  // Clear unread for Priya Patel driver
  await request('PATCH', '/api/driver/notifications/read-all', { Authorization: `Bearer ${driverPriyaToken}` });

  // 1. Create order originating in Kolkata (pickup addr 732, deliv addr 731)
  const orderRes = await request('POST', '/api/customer/orders', { Authorization: `Bearer ${custToken}` }, {
    pickupAddressId: 732,
    deliveryAddressId: 731,
    deliveryType: 'EXPRESS',
    paymentMethod: 'CARD',
    packageDescription: 'Kolkata Origin Express Electronic Equipment',
    packageWeight: 3.2,
    packageQuantity: 1,
    productId: 1,
    items: [{ productId: 1, quantity: 1 }]
  });

  console.log('Kolkata Order Creation Status:', orderRes.status);
  const orderData = orderRes.body?.data || orderRes.body;
  console.log('Order Number:', orderData?.orderNumber);

  // 2. Warehouse Manager processes the shipment to PACKED
  const ccuShipments = await request('GET', '/api/warehouse-manager/shipments/outgoing', { Authorization: `Bearer ${ccuManagerToken}` });
  const targetShipment = ccuShipments.body?.data?.find(s => s.orderNumber === orderData?.orderNumber);
  console.log('Target Shipment in Kolkata:', targetShipment?.id, targetShipment?.trackingNumber);

  if (targetShipment) {
    const pickRes = await request('PATCH', `/api/warehouse-manager/shipments/${targetShipment.id}/stage?stage=PICKING`, { Authorization: `Bearer ${ccuManagerToken}` });
    console.log('Mark Picking Status:', pickRes.status);

    const packRes = await request('POST', `/api/warehouse-manager/shipments/${targetShipment.id}/mark-packed`, { Authorization: `Bearer ${ccuManagerToken}` });
    console.log('Mark Packed Status:', packRes.status);

    // Available driver (Priya Patel: id 13) and vehicle (PR-VH-004: id 8)
    console.log('Assigning Driver Priya Patel (id 13) & Vehicle (id 8)...');
    const assignRes = await request('POST', `/api/warehouse-manager/shipments/${targetShipment.id}/assign-fleet`, { Authorization: `Bearer ${ccuManagerToken}` }, {
      driverId: 13,
      vehicleId: 8
    });
    console.log('Assign Fleet Status:', assignRes.status);

    // 3. Verify Driver Notification!
    const drvNotifs = await request('GET', '/api/driver/notifications', { Authorization: `Bearer ${driverPriyaToken}` });
    const drvCount = await request('GET', '/api/driver/notifications/unread-count', { Authorization: `Bearer ${driverPriyaToken}` });

    console.log('\n>>> DRIVER PRIYA PATEL UNREAD COUNT AFTER ASSIGNMENT:', drvCount.body?.data?.unreadCount);
    console.log('>>> LATEST DRIVER NOTIFICATION:');
    console.log(drvNotifs.body?.data?.[0]);

    // 4. Warehouse Manager dispatches shipment
    console.log('\nDispatching shipment from Kolkata Hub...');
    const dispatchRes = await request('POST', `/api/warehouse-manager/shipments/${targetShipment.id}/dispatch`, { Authorization: `Bearer ${ccuManagerToken}` });
    console.log('Dispatch status:', dispatchRes.status);

    const drvNotifsAfterDispatch = await request('GET', '/api/driver/notifications', { Authorization: `Bearer ${driverPriyaToken}` });
    console.log('>>> DRIVER LATEST NOTIFICATION AFTER DISPATCH:');
    console.log(drvNotifsAfterDispatch.body?.data?.[0]);

    // 5. Driver Starts Trip & Completes Delivery!
    console.log('\nDriver starting trip for active consignment...');
    const startTripRes = await request('POST', `/api/driver/deliveries/${targetShipment.id}/start-trip`, { Authorization: `Bearer ${driverPriyaToken}` });
    console.log('Start Trip Status:', startTripRes.status);

    // Complete delivery with signature
    console.log('Driver completing delivery with ePOD signature...');
    const completeRes = await request('POST', `/api/driver/deliveries/${targetShipment.id}/complete`, { Authorization: `Bearer ${driverPriyaToken}` }, {
      recipientName: 'Customer BLR',
      signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    });
    console.log('Complete Delivery Status:', completeRes.status);

    // Check Driver notifications after delivery completion
    const drvNotifsFinal = await request('GET', '/api/driver/notifications', { Authorization: `Bearer ${driverPriyaToken}` });
    console.log('\n>>> DRIVER LATEST NOTIFICATION AFTER COMPLETE DELIVERY:');
    console.log(drvNotifsFinal.body?.data?.[0]);

    // Check Warehouse Manager notifications after delivery completion
    const wmNotifsFinal = await request('GET', '/api/warehouse-manager/notifications', { Authorization: `Bearer ${ccuManagerToken}` });
    console.log('\n>>> WAREHOUSE MANAGER LATEST NOTIFICATION AFTER DELIVERY:');
    console.log(wmNotifsFinal.body?.data?.[0]);
  }
}

testFullDriverNotificationLifecycle().catch(console.error);
