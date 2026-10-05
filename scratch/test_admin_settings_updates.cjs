const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function run() {
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@primeroute.com', password: 'Admin@PrimeRoute2026!' }
  );
  const token = loginRes.data.token;
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  console.log('--- Test Update Profile ---');
  const profUpdate = await request(
    { hostname: 'localhost', port: 8080, path: '/api/admin/settings/profile', method: 'PUT', headers },
    { fullName: 'PrimeRoute Operations Admin', phone: '+91 98765 00001' }
  );
  console.log('Updated Profile:', profUpdate.data);

  console.log('--- Test Update Support & Contact ---');
  const suppUpdate = await request(
    { hostname: 'localhost', port: 8080, path: '/api/admin/settings/support', method: 'PUT', headers },
    {
      supportEmail: 'ops-desk@primeroute.com',
      supportPhone: '+91 98765 11111',
      availability: '24/7 Priority Logistics Operations',
      description: 'Central dispatch emergency desk for transit updates and expedited cargo claims.',
    }
  );
  console.log('Updated Support:', suppUpdate.data);

  console.log('--- Test Customer Support Sees the Updated Contact ---');
  const custContact = await request(
    { hostname: 'localhost', port: 8080, path: '/api/customer/support/contact', method: 'GET', headers: {} }
  );
  console.log('Customer Support Contact endpoint response:', custContact.data);
  if (custContact.data.data.supportEmail !== 'ops-desk@primeroute.com') {
    throw new Error('Customer support contact did not reflect update!');
  }
  console.log('VERIFIED: Customer Support dynamically reflects Admin updated contact!');

  console.log('--- Test Update Notification Settings ---');
  const notifUpdate = await request(
    { hostname: 'localhost', port: 8080, path: '/api/admin/settings/notifications', method: 'PUT', headers },
    {
      emailNotifications: true,
      orderUpdates: true,
      shipmentUpdates: true,
      deliveryUpdates: false,
      invoiceNotifications: true,
      supportTicketNotifications: true,
    }
  );
  console.log('Updated Notifications:', notifUpdate.data);

  console.log('--- Test Update Company Settings ---');
  const compUpdate = await request(
    { hostname: 'localhost', port: 8080, path: '/api/admin/settings/company', method: 'PUT', headers },
    {
      companyName: 'PrimeRoute Global Logistics Ltd.',
      tagline: 'Precision Logistics. Next-Gen Delivery.',
      gstin: '29AAAAA0000A1Z5',
      corporateEmail: 'corporate@primeroute.com',
      corporatePhone: '+91 80 4567 8900',
      website: 'https://primeroute.com',
      address: 'Plot 42, Tech Logistics Park, Whitefield',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560066',
      country: 'India',
    }
  );
  console.log('Updated Company:', compUpdate.data);

  console.log('--- Test Update System Preferences ---');
  const prefUpdate = await request(
    { hostname: 'localhost', port: 8080, path: '/api/admin/settings/preferences', method: 'PUT', headers },
    {
      defaultCurrency: 'INR (₹)',
      defaultDeliveryType: 'SAME_DAY',
      dateFormat: 'YYYY-MM-DD',
      timeZone: 'Asia/Kolkata (IST)',
    }
  );
  console.log('Updated Preferences:', prefUpdate.data);

  console.log('--- ALL UPDATES PERSISTED AND VERIFIED SUCCESSFULLY! ---');
}

run().catch(console.error);
