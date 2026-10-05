const http = require('http');

async function testAdminPasswordChangeFlow() {
  console.log('=== TESTING ADMIN PASSWORD CHANGE FLOW ===\n');

  // 1. Login with admin@primeroute.com / Password@123
  const loginData = JSON.stringify({ email: 'admin@primeroute.com', password: 'Password@123' });
  const loginRes = await makeReq('/api/auth/login', 'POST', loginData);
  const auth = JSON.parse(loginRes.body);
  console.log('1. Admin Login with Password@123:', loginRes.statusCode, 'Token exists:', !!auth.token);

  if (!auth.token) {
    console.error('Login failed, cannot test admin change password');
    return;
  }

  // 2. Change password via Admin Settings (/api/admin/settings/security/change-password)
  const changeData = JSON.stringify({
    currentPassword: 'Password@123',
    newPassword: 'Admin@Secure2026!',
    confirmPassword: 'Admin@Secure2026!'
  });
  const changeRes = await makeReq('/api/admin/settings/security/change-password', 'POST', changeData, auth.token);
  console.log('2. Admin Change Password to Admin@Secure2026! Response:', changeRes.statusCode, changeRes.body);

  // 3. Test Login with NEW password
  const newLoginData = JSON.stringify({ email: 'admin@primeroute.com', password: 'Admin@Secure2026!' });
  const newLoginRes = await makeReq('/api/auth/login', 'POST', newLoginData);
  console.log('3. Login with Admin@Secure2026! Status:', newLoginRes.statusCode, newLoginRes.statusCode === 200 ? 'SUCCESS' : 'FAILED');

  // 4. Revert Password back to Password@123
  const authNew = JSON.parse(newLoginRes.body);
  const revertData = JSON.stringify({
    currentPassword: 'Admin@Secure2026!',
    newPassword: 'Password@123',
    confirmPassword: 'Password@123'
  });
  const revertRes = await makeReq('/api/admin/settings/security/change-password', 'POST', revertData, authNew.token);
  console.log('4. Revert Password back to Password@123 Response:', revertRes.statusCode, revertRes.body);

  // 5. Verify Password@123 works again
  const verifyRes = await makeReq('/api/auth/login', 'POST', loginData);
  console.log('5. Verify Login with Password@123 Status:', verifyRes.statusCode, verifyRes.statusCode === 200 ? 'SUCCESS' : 'FAILED');
}

function makeReq(path, method, data, token) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (data) headers['Content-Length'] = Buffer.byteLength(data);
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path,
      method,
      headers
    }, (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: b }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

testAdminPasswordChangeFlow().catch(console.error);
