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
  console.log('1. Logging in with current password (customer123)...');
  const loginData = JSON.stringify({
    email: 'shrutisanjanasahoo@gmail.com',
    password: 'customer123'
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

  console.log('Login response status:', loginRes.status);
  const token = loginRes.body.token;
  if (!token) {
    console.error('No token returned:', loginRes.body);
    return;
  }
  console.log('Token received successfully.');

  console.log('2. Calling /api/customer/profile/change-password with Shruti@1234!...');
  const changeData = JSON.stringify({
    currentPassword: 'customer123',
    newPassword: 'Shruti@1234!',
    confirmPassword: 'Shruti@1234!'
  });

  const changeRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/customer/profile/change-password',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Length': Buffer.byteLength(changeData)
    }
  }, changeData);

  console.log('Change password response:', changeRes.status, changeRes.body);

  console.log('3. Verifying login with the NEW password: Shruti@1234!...');
  const verifyData = JSON.stringify({
    email: 'shrutisanjanasahoo@gmail.com',
    password: 'Shruti@1234!'
  });

  const verifyRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(verifyData)
    }
  }, verifyData);

  console.log('Verification status:', verifyRes.status);
  console.log('Verification response:', verifyRes.body);
}

run().catch(console.error);
