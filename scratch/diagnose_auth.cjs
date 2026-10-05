const http = require('http');

function apiRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: json, raw: body });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function testLogin(email, password) {
  const res = await apiRequest(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email, password }
  );
  return { status: res.status, data: res.data };
}

async function main() {
  console.log('Testing authentication for various accounts and passwords:');

  const passwords = [
    'Driver@2026!',
    'Manager@2026!',
    'Customer@2026!',
    'Admin@2026!',
    'Password@123',
    'password123',
    'admin123',
    'prime123',
    'Priya@123',
    'Priya@2026!',
    'Shruti@2026!',
  ];

  const emails = [
    'shrutisanjanasahoo@gmail.com',
    'priya@primeroute.com',
    'admin@primeroute.com',
    'ramesh@primeroute.com',
    'suresh@primeroute.com',
  ];

  for (const email of emails) {
    console.log(`\nChecking email: ${email}`);
    for (const pwd of passwords) {
      const res = await testLogin(email, pwd);
      if (res.status === 200) {
        console.log(`  ✓ SUCCESS with password "${pwd}"! Role: ${res.data?.role || res.data?.data?.role || JSON.stringify(res.data)}`);
        break;
      }
    }
  }
}

main().catch(console.error);
