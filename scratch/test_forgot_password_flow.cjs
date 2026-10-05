const http = require('http');

function post(path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw) });
        } catch (e) {
          resolve({ status: res.statusCode, data: raw });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function test() {
  const email = "shrutisanjanasahoo@gmail.com";
  console.log(`=== Testing Forgot Password & Login for ${email} ===\n`);

  console.log('Step 1: Requesting Forgot Password...');
  const fpRes = await post('/api/auth/forgot-password', { email });
  console.log('Forgot Password response:', fpRes);

  const resetUrl = fpRes.data?.resetUrl;
  let rawToken = null;
  if (resetUrl && resetUrl.includes('token=')) {
    rawToken = resetUrl.split('token=')[1];
  }
  console.log('Acquired rawToken from response:', rawToken ? `${rawToken.substring(0, 8)}...` : 'NONE');

  if (!rawToken) {
    console.error('No reset token obtained from forgot password response!');
    return;
  }

  const newTestPassword = "NewCustomerPass@2026!";
  console.log(`\nStep 2: Submitting Reset Password with token...`);
  const resetRes = await post('/api/auth/reset-password', {
    token: rawToken,
    newPassword: newTestPassword,
    confirmPassword: newTestPassword
  });
  console.log('Reset Password response:', resetRes);

  console.log(`\nStep 3: Attempting Login with NEW password...`);
  const loginRes = await post('/api/auth/login', {
    email: email,
    password: newTestPassword
  });
  console.log('Login with NEW password response:', {
    status: loginRes.status,
    success: !!loginRes.data?.token,
    role: loginRes.data?.role,
    user: loginRes.data?.email
  });

  console.log(`\nStep 4: Attempting Login with OLD/wrong password (should be 401)...`);
  const oldLoginRes = await post('/api/auth/login', {
    email: email,
    password: "OldWrongPassword@123"
  });
  console.log('Login with OLD password response status:', oldLoginRes.status);
}

test().catch(console.error);
