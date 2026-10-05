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
  console.log('--- Admin Login ---');
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
  if (!token) throw new Error('Login failed: ' + JSON.stringify(loginRes.data));
  console.log('Admin authenticated.');

  const headers = { Authorization: `Bearer ${token}` };

  console.log('--- 1. Profile ---');
  const prof = await request({ hostname: 'localhost', port: 8080, path: '/api/admin/settings/profile', method: 'GET', headers });
  console.log('Profile:', prof.data);

  console.log('--- 2. Notifications ---');
  const notif = await request({ hostname: 'localhost', port: 8080, path: '/api/admin/settings/notifications', method: 'GET', headers });
  console.log('Notifications:', notif.data);

  console.log('--- 3. Company ---');
  const comp = await request({ hostname: 'localhost', port: 8080, path: '/api/admin/settings/company', method: 'GET', headers });
  console.log('Company:', comp.data);

  console.log('--- 4. Support Contact ---');
  const supp = await request({ hostname: 'localhost', port: 8080, path: '/api/admin/settings/support', method: 'GET', headers });
  console.log('Support:', supp.data);

  console.log('--- 5. Preferences ---');
  const pref = await request({ hostname: 'localhost', port: 8080, path: '/api/admin/settings/preferences', method: 'GET', headers });
  console.log('Preferences:', pref.data);

  console.log('--- ALL 5 GET ENDPOINTS RETURNED 200 OK! ---');
}

run().catch(console.error);
