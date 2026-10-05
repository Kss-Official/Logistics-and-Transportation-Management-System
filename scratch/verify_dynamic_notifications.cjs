const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function run() {
  console.log('====================================================');
  console.log('1. AUTHENTICATION (ADMIN & CUSTOMER)');
  console.log('====================================================');

  // Login Admin
  const adminLogin = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@primeroute.com', password: 'Admin@PrimeRoute2026!' }
  );

  const adminToken = adminLogin.data.token || adminLogin.data.data?.token;
  if (!adminToken) {
    throw new Error('Admin login failed: ' + JSON.stringify(adminLogin.data));
  }
  console.log('✓ Admin authenticated successfully.');

  // Login Customer
  const custLogin = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'customer@primeroute.com', password: 'Customer@123' }
  );

  const custToken = custLogin.data.token || custLogin.data.data?.token;
  if (!custToken) {
    throw new Error('Customer login failed: ' + JSON.stringify(custLogin.data));
  }
  console.log('✓ Customer authenticated successfully.');

  console.log('\n====================================================');
  console.log('2. GET CURRENT NOTIFICATION SETTINGS FROM BACKEND');
  console.log('====================================================');

  const getSettingsRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/settings/notifications',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  console.log('Current Settings Response Status:', getSettingsRes.status);
  console.log('Current Settings Data:', JSON.stringify(getSettingsRes.data.data, null, 2));

  console.log('\n====================================================');
  console.log('3. TEST SAVE: TURN ORDER STATUS UPDATES OFF');
  console.log('====================================================');

  const updateOffRes = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/settings/notifications',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    {
      emailNotifications: false,
      orderUpdates: false,
      shipmentUpdates: true,
      deliveryUpdates: true,
      invoiceNotifications: false,
      supportTicketNotifications: true,
    }
  );

  console.log('Update (OFF) Status:', updateOffRes.status);
  console.log('Update (OFF) Data:', JSON.stringify(updateOffRes.data.data, null, 2));

  // Get Admin notification count before event
  const notifBeforeRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/notifications',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const notifCountBefore = Array.isArray(notifBeforeRes.data.data) ? notifBeforeRes.data.data.length : 0;
  console.log('Admin notifications count before event:', notifCountBefore);

  console.log('\n====================================================');
  console.log('4. CREATE ORDER WHILE ORDER UPDATES ARE OFF');
  console.log('====================================================');

  const createOrder1 = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/customer/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}`,
      },
    },
    {
      pickupAddressId: 1,
      deliveryAddressId: 2,
      packageDescription: 'Test Order with Notifications OFF',
      packageWeight: 15.0,
      packageQuantity: 1,
      deliveryType: 'EXPRESS',
    }
  );

  console.log('Order 1 Creation Status:', createOrder1.status);
  console.log('Order 1 Number:', createOrder1.data.data?.orderNumber);

  // Check Admin notifications now
  const notifAfterOffRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/notifications',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const notifCountAfterOff = Array.isArray(notifAfterOffRes.data.data) ? notifAfterOffRes.data.data.length : 0;
  console.log('Admin notifications count after event (OFF):', notifCountAfterOff);

  if (notifCountAfterOff === notifCountBefore) {
    console.log('>>> SUCCESS: No order notification was generated for Admin when orderUpdates was OFF!');
  } else {
    console.error('>>> FAILURE: Notification was generated despite orderUpdates being OFF!');
  }

  console.log('\n====================================================');
  console.log('5. TEST SAVE: TURN ORDER STATUS UPDATES ON');
  console.log('====================================================');

  const updateOnRes = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/settings/notifications',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    {
      emailNotifications: true,
      orderUpdates: true,
      shipmentUpdates: true,
      deliveryUpdates: true,
      invoiceNotifications: true,
      supportTicketNotifications: true,
    }
  );

  console.log('Update (ON) Status:', updateOnRes.status);
  console.log('Update (ON) Data:', JSON.stringify(updateOnRes.data.data, null, 2));

  console.log('\n====================================================');
  console.log('6. CREATE ORDER WHILE ORDER UPDATES ARE ON');
  console.log('====================================================');

  const createOrder2 = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/customer/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}`,
      },
    },
    {
      pickupAddressId: 1,
      deliveryAddressId: 2,
      packageDescription: 'Test Order with Notifications ON',
      packageWeight: 10.0,
      packageQuantity: 1,
      deliveryType: 'STANDARD',
    }
  );

  console.log('Order 2 Creation Status:', createOrder2.status);
  console.log('Order 2 Number:', createOrder2.data.data?.orderNumber);

  // Check Admin notifications now
  const notifAfterOnRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/notifications',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const notifs = notifAfterOnRes.data.data || [];
  console.log('Admin notifications count after event (ON):', notifs.length);
  const latestNotif = notifs[0];
  console.log('Latest Admin Notification:', {
    id: latestNotif?.id,
    title: latestNotif?.title,
    message: latestNotif?.message,
    type: latestNotif?.type,
  });

  if (notifs.length > notifCountAfterOff && latestNotif?.type === 'NEW_ORDER') {
    console.log('>>> SUCCESS: Order notification was generated and received by Admin when orderUpdates was ON!');
  } else {
    console.error('>>> FAILURE: Expected new order notification was not found!');
  }

  console.log('\n====================================================');
  console.log('7. DYNAMIC TEST - SUPPORT TICKET NOTIFICATIONS');
  console.log('====================================================');

  // 7a. Turn Support Ticket notifications OFF
  await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/settings/notifications',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    {
      emailNotifications: true,
      orderUpdates: true,
      shipmentUpdates: true,
      deliveryUpdates: true,
      invoiceNotifications: true,
      supportTicketNotifications: false,
    }
  );

  const countBeforeSupport = (await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/notifications',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  })).data.data?.length || 0;

  // Customer creates a support ticket
  const ticket1 = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/customer/support/tickets',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}`,
      },
    },
    {
      subject: 'Inquiry with Support Notifications OFF',
      category: 'GENERAL_INQUIRY',
      priority: 'LOW',
      description: 'Testing preference suppression for support tickets.',
    }
  );
  console.log('Ticket 1 Created:', ticket1.data.data?.ticketNumber);

  const countAfterSupportOff = (await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/notifications',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  })).data.data?.length || 0;

  console.log('Support Ticket (OFF) - Admin notification count before vs after:', countBeforeSupport, 'vs', countAfterSupportOff);
  if (countAfterSupportOff === countBeforeSupport) {
    console.log('>>> SUCCESS: Support ticket notification was suppressed for Admin when supportTicketNotifications was OFF!');
  } else {
    console.error('>>> FAILURE: Support ticket notification was not suppressed!');
  }

  // 7b. Turn Support Ticket notifications ON
  await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/settings/notifications',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    {
      emailNotifications: true,
      orderUpdates: true,
      shipmentUpdates: true,
      deliveryUpdates: true,
      invoiceNotifications: true,
      supportTicketNotifications: true,
    }
  );

  // Customer creates another ticket
  const ticket2 = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/customer/support/tickets',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}`,
      },
    },
    {
      subject: 'Inquiry with Support Notifications ON',
      category: 'GENERAL_INQUIRY',
      priority: 'MEDIUM',
      description: 'Testing preference activation for support tickets.',
    }
  );
  console.log('Ticket 2 Created:', ticket2.data.data?.ticketNumber);

  const notifsAfterSupportOn = (await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/notifications',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  })).data.data || [];

  const latestSupportNotif = notifsAfterSupportOn[0];
  console.log('Latest Notification:', {
    title: latestSupportNotif?.title,
    message: latestSupportNotif?.message,
    type: latestSupportNotif?.type,
  });

  if (latestSupportNotif?.type === 'SUPPORT_TICKET') {
    console.log('>>> SUCCESS: Support ticket notification was generated and received by Admin when supportTicketNotifications was ON!');
  } else {
    console.error('>>> FAILURE: Expected support ticket notification was not found!');
  }

  console.log('\n====================================================');
  console.log('8. VERIFY REFRESH / RESTORE PREFERENCES');
  console.log('====================================================');

  // Save specific pattern
  const pattern = {
    emailNotifications: false,
    orderUpdates: true,
    shipmentUpdates: false,
    deliveryUpdates: true,
    invoiceNotifications: false,
    supportTicketNotifications: true,
  };
  await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/settings/notifications',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    pattern
  );

  // Re-fetch to simulate page reload
  const reloaded = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/settings/notifications',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  const reloadedData = reloaded.data.data;
  console.log('Reloaded Data:', reloadedData);

  const matches =
    reloadedData.emailNotifications === pattern.emailNotifications &&
    reloadedData.orderUpdates === pattern.orderUpdates &&
    reloadedData.shipmentUpdates === pattern.shipmentUpdates &&
    reloadedData.deliveryUpdates === pattern.deliveryUpdates &&
    reloadedData.invoiceNotifications === pattern.invoiceNotifications &&
    reloadedData.supportTicketNotifications === pattern.supportTicketNotifications;

  if (matches) {
    console.log('>>> SUCCESS: Notification preferences persist accurately across reloads!');
  } else {
    console.error('>>> FAILURE: Reloaded settings do not match saved pattern!');
  }

  // Restore all to true for default production state
  await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/settings/notifications',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    {
      emailNotifications: true,
      orderUpdates: true,
      shipmentUpdates: true,
      deliveryUpdates: true,
      invoiceNotifications: true,
      supportTicketNotifications: true,
    }
  );
  console.log('✓ Restored all notification preferences to true for default operational state.');
}

run().catch((err) => {
  console.error('Test script encountered an error:', err);
  process.exit(1);
});
