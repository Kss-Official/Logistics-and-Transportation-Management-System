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
  const forgotResp = await post('/api/auth/forgot-password', {
    email: 'sanjanaaa.shru@gmail.com'
  });
  const token = forgotResp.data.resetUrl.split('token=')[1];
  const resetResp = await post('/api/auth/reset-password', {
    token: token,
    newPassword: 'Sanj@102026',
    confirmPassword: 'Sanj@102026'
  });
  console.log('Admin password reset result:', resetResp);
}

run().catch(console.error);
