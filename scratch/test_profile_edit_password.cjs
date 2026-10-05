const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('1. Log in with Shruti@1234!...');
  const loginData = JSON.stringify({
    email: 'shrutisanjanasahoo@gmail.com',
    password: 'Shruti@1234!'
  });

  const loginRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  }, loginData);

  const token = loginRes.body.token;
  console.log('Login status:', loginRes.status, 'Token OK?', !!token);

  console.log('2. Updating customer profile details...');
  const profileData = JSON.stringify({
    fullName: 'Shruti Sanjana Sahoo',
    phone: '9876543210',
    companyName: 'Prime Logistics Retail'
  });

  const updateRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/customer/profile',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Length': Buffer.byteLength(profileData)
    }
  }, profileData);

  console.log('Profile update status:', updateRes.status);

  console.log('3. Logging in AGAIN with Shruti@1234! to verify password was preserved...');
  const reLoginRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  }, loginData);

  console.log('Re-login status after profile edit:', reLoginRes.status);
  console.log('Re-login body:', reLoginRes.body);
}

run().catch(console.error);
