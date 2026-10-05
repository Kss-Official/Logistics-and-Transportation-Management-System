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
  const custLogin = await request(
    { hostname: 'localhost', port: 8080, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'customer@primeroute.com', password: 'Customer@123' }
  );
  const custToken = custLogin.data.token;

  console.log('--- Calling Customer Support Contact with Customer Token ---');
  const custContact = await request(
    { hostname: 'localhost', port: 8080, path: '/api/customer/support/contact', method: 'GET', headers: { Authorization: `Bearer ${custToken}` } }
  );
  console.log('Customer Support Contact endpoint response:', custContact.data);
  if (custContact.data.data.supportEmail !== 'ops-desk@primeroute.com') {
    throw new Error('Customer support contact did not reflect update! Found: ' + custContact.data.data.supportEmail);
  }
  console.log('VERIFIED: Customer Support dynamically receives the Admin updated contact data:');
  console.log(' - Email:', custContact.data.data.supportEmail);
  console.log(' - Phone:', custContact.data.data.supportPhone);
  console.log(' - Availability:', custContact.data.data.availability);
  console.log(' - Description:', custContact.data.data.description);
}

run().catch(console.error);
