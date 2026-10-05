const http = require('http');

async function testPasswordChangeFlow() {
  console.log('=== TESTING COMPLETE PASSWORD CHANGE FLOWS ===\n');

  // 1. Login with gudisahoo@gmail.com / Gudi@450
  const loginData = JSON.stringify({ email: 'gudisahoo@gmail.com', password: 'Gudi@450' });
  const loginRes = await makeReq('/api/auth/login', 'POST', loginData);
  const auth = JSON.parse(loginRes.body);
  console.log('1. Customer Login with Gudi@450:', loginRes.statusCode, 'Token exists:', !!auth.token);

  if (!auth.token) {
    console.error('Login failed, cannot test profile change password');
    return;
  }

  // 2. Change password via Profile (/api/customer/profile/change-password)
  const changeData = JSON.stringify({
    currentPassword: 'Gudi@450',
    newPassword: 'Gudi@450New!'
  });
  const changeRes = await makeReq('/api/customer/profile/change-password', 'POST', changeData, auth.token);
  console.log('2. Customer Change Password to Gudi@450New! Response:', changeRes.statusCode, changeRes.body);

  // 3. Test Login with NEW password
  const newLoginData = JSON.stringify({ email: 'gudisahoo@gmail.com', password: 'Gudi@450New!' });
  const newLoginRes = await makeReq('/api/auth/login', 'POST', newLoginData);
  console.log('3. Login with Gudi@450New! Status:', newLoginRes.statusCode, newLoginRes.statusCode === 200 ? 'SUCCESS' : 'FAILED');

  // 4. Change password BACK to Gudi@450
  const authNew = JSON.parse(newLoginRes.body);
  const revertData = JSON.stringify({
    currentPassword: 'Gudi@450New!',
    newPassword: 'Gudi@450'
  });
  const revertRes = await makeReq('/api/customer/profile/change-password', 'POST', revertData, authNew.token);
  console.log('4. Revert Password back to Gudi@450 Response:', revertRes.statusCode, revertRes.body);

  // 5. Verify Gudi@450 works again
  const verifyRes = await makeReq('/api/auth/login', 'POST', loginData);
  console.log('5. Verify Login with Gudi@450 Status:', verifyRes.statusCode, verifyRes.statusCode === 200 ? 'SUCCESS' : 'FAILED');
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

testPasswordChangeFlow().catch(console.error);
