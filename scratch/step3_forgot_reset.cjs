const http = require('http');

function post(path, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('--- 1. Calling /api/auth/forgot-password ---');
  const forgotResp = await post('/api/auth/forgot-password', {
    email: 'shrutisanjanasahoo@gmail.com'
  });
  console.log('Forgot Password response:', forgotResp);

  const resetUrl = forgotResp.data.resetUrl;
  if (!resetUrl) {
    throw new Error('No resetUrl returned!');
  }

  const token = resetUrl.split('token=')[1];
  console.log('Extracted Token:', token);

  const NEW_PASSWORD = 'Shruti@NewPass2026!';
  console.log('--- 2. Calling /api/auth/reset-password with new password: ' + NEW_PASSWORD + ' ---');
  const resetResp = await post('/api/auth/reset-password', {
    token: token,
    newPassword: NEW_PASSWORD,
    confirmPassword: NEW_PASSWORD
  });
  console.log('Reset Password response:', resetResp);
}

run().catch(console.error);
