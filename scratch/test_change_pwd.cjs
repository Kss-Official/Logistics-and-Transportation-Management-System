const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const dataStr = data ? JSON.stringify(data) : null;
    if (dataStr) {
      options.headers = options.headers || {};
      options.headers['Content-Length'] = Buffer.byteLength(dataStr);
    }
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
    if (dataStr) req.write(dataStr);
    req.end();
  });
}

async function run() {
  console.log('Logging in with Customer@123...');
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@primeroute.com', password: 'Customer@123' }
  );

  const token = loginRes.data.token;
  console.log('Login successful! Changing password to Admin@PrimeRoute2026! via Spring Boot API...');

  const changeRes = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/settings/security/change-password',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    {
      currentPassword: 'Customer@123',
      newPassword: 'Admin@PrimeRoute2026!',
      confirmPassword: 'Admin@PrimeRoute2026!',
    }
  );

  console.log('Change password response:', changeRes.data);

  console.log('Verifying login with new password Admin@PrimeRoute2026!...');
  const verifyLogin = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@primeroute.com', password: 'Admin@PrimeRoute2026!' }
  );

  console.log('Login with Admin@PrimeRoute2026! status:', verifyLogin.status, 'Success:', !!verifyLogin.data.token);
  if (!verifyLogin.data.token) {
    throw new Error('Failed to login with Admin@PrimeRoute2026!');
  }
  console.log('SUCCESS! Admin password is now Admin@PrimeRoute2026!.');
}

run().catch(console.error);
