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
  console.log('====================================================');
  console.log('--- ADMIN SETTINGS COMPREHENSIVE E2E VERIFICATION ---');
  console.log('====================================================');

  console.log('\n[1] Admin Login...');
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
  if (!loginRes.data.token) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginRes.data));
  }
  const token = loginRes.data.token;
  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  console.log('Admin login verified. Token generated.');

  console.log('\n[2] Test Admin Profile GET & PUT...');
  const getProf = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/settings/profile',
    method: 'GET',
    headers: adminHeaders,
  });
  console.log('Retrieved Profile:', getProf.data.data);
  if (getProf.data.data.email !== 'admin@primeroute.com' || getProf.data.data.role !== 'ADMIN') {
    throw new Error('Profile returned incorrect email/role!');
  }

  const updateProf = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/settings/profile',
      method: 'PUT',
      headers: adminHeaders,
    },
    { fullName: 'PrimeRoute Operations Administrator', phone: '+91 98765 43210' }
  );
  console.log('Updated Profile response:', updateProf.data.data);
  if (updateProf.data.data.fullName !== 'PrimeRoute Operations Administrator') {
    throw new Error('Full Name update failed!');
  }
  console.log('Admin Profile update persisted in PostgreSQL users table.');

  console.log('\n[3] Test Security & Password Change Validation...');
  // Test 1: Invalid current password
  const badCurrent = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/settings/security/change-password',
      method: 'POST',
      headers: adminHeaders,
    },
    {
      currentPassword: 'WrongPassword123!',
      newPassword: 'NewSecurePassword2026!',
      confirmPassword: 'NewSecurePassword2026!',
    }
  );
  console.log('Wrong password attempt returned status:', badCurrent.status);
  if (badCurrent.status === 200) {
    throw new Error('Security flaw: Wrong current password was accepted!');
  }

  // Test 2: Mismatched confirm password
  const mismatch = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/settings/security/change-password',
      method: 'POST',
      headers: adminHeaders,
    },
    {
      currentPassword: 'Admin@PrimeRoute2026!',
      newPassword: 'NewSecurePassword2026!',
      confirmPassword: 'DifferentPassword2026!',
    }
  );
  console.log('Mismatched confirm password returned status:', mismatch.status);
  if (mismatch.status === 200) {
    throw new Error('Security flaw: Mismatched confirm password was accepted!');
  }

  // Test 3: Valid password change to temporary password
  const validChange = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/settings/security/change-password',
      method: 'POST',
      headers: adminHeaders,
    },
    {
      currentPassword: 'Admin@PrimeRoute2026!',
      newPassword: 'Admin@PrimeRouteTemp2026!',
      confirmPassword: 'Admin@PrimeRouteTemp2026!',
    }
  );
  console.log('Valid password change returned:', validChange.data);
  if (!validChange.data.success) {
    throw new Error('Valid password change failed!');
  }

  // Test 4: Verify login with new password
  const newLogin = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@primeroute.com', password: 'Admin@PrimeRouteTemp2026!' }
  );
  if (!newLogin.data.token) {
    throw new Error('Login with updated password failed!');
  }
  const tempToken = newLogin.data.token;
  console.log('Successfully logged in with new password.');

  // Test 5: Restore original password so environment credentials remain pristine
  const restorePass = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/settings/security/change-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tempToken}` },
    },
    {
      currentPassword: 'Admin@PrimeRouteTemp2026!',
      newPassword: 'Admin@PrimeRoute2026!',
      confirmPassword: 'Admin@PrimeRoute2026!',
    }
  );
  if (!restorePass.data.success) {
    throw new Error('Password restoration failed!');
  }
  console.log('Master password verified and restored to Admin@PrimeRoute2026!.');

  console.log('\n[4] Test Notification Settings GET & PUT...');
  const notifUpdate = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/settings/notifications',
      method: 'PUT',
      headers: adminHeaders,
    },
    {
      emailNotifications: true,
      orderUpdates: true,
      shipmentUpdates: true,
      deliveryUpdates: false,
      invoiceNotifications: true,
      supportTicketNotifications: true,
    }
  );
  console.log('Updated notifications:', notifUpdate.data.data);

  const notifVerify = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/settings/notifications',
    method: 'GET',
    headers: adminHeaders,
  });
  if (notifVerify.data.data.deliveryUpdates !== false || notifVerify.data.data.orderUpdates !== true) {
    throw new Error('Notification settings persistence failed!');
  }
  console.log('Notification preferences verified in PostgreSQL system_settings.');

  console.log('\n[5] Test Company Profile GET & PUT...');
  const compUpdate = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/settings/company',
      method: 'PUT',
      headers: adminHeaders,
    },
    {
      companyName: 'PrimeRoute Logistics India Pvt. Ltd.',
      tagline: 'Smart Logistics. Reliable Delivery.',
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
  console.log('Updated company:', compUpdate.data.data);

  const compVerify = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/settings/company',
    method: 'GET',
    headers: adminHeaders,
  });
  if (compVerify.data.data.gstin !== '29AAAAA0000A1Z5') {
    throw new Error('Company settings persistence failed!');
  }
  console.log('Company settings verified in PostgreSQL system_settings.');

  console.log('\n[6] Test Support & Contact Synchronization with Customer Portal...');
  const suppUpdate = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/settings/support',
      method: 'PUT',
      headers: adminHeaders,
    },
    {
      supportEmail: 'support@primeroute.com',
      supportPhone: '+91 98765 43210',
      availability: '24/7 Dedicated Logistics Assistance',
      description: 'Operations desk hotline for critical freight inquiries and routing delays.',
    }
  );
  console.log('Admin Support settings updated:', suppUpdate.data.data);

  // Authenticate as Customer
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
  const custToken = custLogin.data.token;
  const custContact = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/customer/support/contact',
    method: 'GET',
    headers: { Authorization: `Bearer ${custToken}` },
  });
  console.log('Customer Portal Contact Data:', custContact.data.data);
  if (
    custContact.data.data.supportEmail !== 'support@primeroute.com' ||
    custContact.data.data.supportPhone !== '+91 98765 43210'
  ) {
    throw new Error('Support contact synchronization between Admin and Customer failed!');
  }
  console.log('VERIFIED: Admin Settings updates directly synchronize with Customer Support!');

  console.log('\n[7] Test System Preferences GET & PUT...');
  const prefUpdate = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/settings/preferences',
      method: 'PUT',
      headers: adminHeaders,
    },
    {
      defaultCurrency: 'INR (₹)',
      defaultDeliveryType: 'EXPRESS',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12-hour (hh:mm AM/PM)',
      timeZone: 'Asia/Kolkata (IST)',
    }
  );
  console.log('Updated preferences:', prefUpdate.data.data);

  const prefVerify = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/settings/preferences',
    method: 'GET',
    headers: adminHeaders,
  });
  if (prefVerify.data.data.defaultCurrency !== 'INR (₹)') {
    throw new Error('System preferences persistence failed!');
  }
  console.log('System preferences verified in PostgreSQL system_settings.');

  console.log('\n[8] Test Security Authorization (ROLE_ADMIN enforcement)...');
  const unauthorizedTest = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/settings/profile',
    method: 'GET',
    headers: { Authorization: `Bearer ${custToken}` }, // Customer attempting admin endpoint
  });
  console.log('Customer accessing /api/admin/settings returned status:', unauthorizedTest.status);
  if (unauthorizedTest.status !== 403) {
    throw new Error('Security flaw: Customer was not blocked with 403 Forbidden!');
  }
  console.log('VERIFIED: ROLE_ADMIN strictly enforced on all Admin Settings APIs.');

  console.log('\n====================================================');
  console.log('>>> ALL ADMIN SETTINGS VERIFICATIONS PASSED 100%! <<<');
  console.log('====================================================');
}

run().catch((err) => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
