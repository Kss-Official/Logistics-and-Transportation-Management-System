const http = require('http');

async function testCompleteForgotResetLoginFlow() {
  console.log('=== TEST 1: CUSTOMER FORGOT PASSWORD -> RESET -> LOGIN FLOW ===\n');

  const customerEmail = 'gudisahoo@gmail.com';

  // Step 1: Request Forgot Password
  console.log(`1. Requesting forgot-password for ${customerEmail}...`);
  const forgotData = JSON.stringify({ email: customerEmail });
  const forgotRes = await makeReq('/api/auth/forgot-password', 'POST', forgotData);
  console.log('Forgot Password Response:', forgotRes.statusCode, forgotRes.body);

  const forgotParsed = JSON.parse(forgotRes.body);
  const resetUrl = forgotParsed.resetUrl;
  console.log('Generated Reset URL:', resetUrl);

  const tokenMatch = resetUrl ? resetUrl.match(/token=([^&]+)/) : null;
  const token = tokenMatch ? tokenMatch[1] : null;

  if (!token) {
    console.error('Failed to obtain reset token');
    return;
  }
  console.log('Extracted Token for reset:', token.slice(0, 10) + '...');

  // Step 2: Reset Password to a new password
  const newPassword = 'Gudi@NewPass2026!';
  console.log(`\n2. Resetting password to ${newPassword}...`);
  const resetData = JSON.stringify({
    token: token,
    newPassword: newPassword,
    confirmPassword: newPassword
  });
  const resetRes = await makeReq('/api/auth/reset-password', 'POST', resetData);
  console.log('Reset Password Response:', resetRes.statusCode, resetRes.body);

  // Step 3: Login with OLD password (should FAIL with 401)
  console.log(`\n3. Testing login with OLD password (Gudi@450)...`);
  const oldLoginRes = await makeReq('/api/auth/login', 'POST', JSON.stringify({
    email: customerEmail,
    password: 'Gudi@450'
  }));
  console.log('Old Password Login Status:', oldLoginRes.statusCode, '(Expected 401):', oldLoginRes.statusCode === 401 ? 'PASS' : 'FAIL');

  // Step 4: Login with NEW password (should SUCCEED with 200)
  console.log(`\n4. Testing login with NEW password (${newPassword})...`);
  const newLoginRes = await makeReq('/api/auth/login', 'POST', JSON.stringify({
    email: customerEmail,
    password: newPassword
  }));
  console.log('New Password Login Status:', newLoginRes.statusCode, '(Expected 200):', newLoginRes.statusCode === 200 ? 'PASS' : 'FAIL');
  if (newLoginRes.statusCode === 200) {
    const authData = JSON.parse(newLoginRes.body);
    console.log('Login JWT acquired:', !!authData.token, 'Role:', authData.role);
  }

  // Step 5: Second Reset - Revert back to Gudi@450
  console.log(`\n5. Requesting second forgot-password to revert to Gudi@450...`);
  const forgot2Res = await makeReq('/api/auth/forgot-password', 'POST', forgotData);
  const forgot2Parsed = JSON.parse(forgot2Res.body);
  const token2 = forgot2Parsed.resetUrl.match(/token=([^&]+)/)[1];

  const reset2Res = await makeReq('/api/auth/reset-password', 'POST', JSON.stringify({
    token: token2,
    newPassword: 'Gudi@450',
    confirmPassword: 'Gudi@450'
  }));
  console.log('Revert Reset Response:', reset2Res.statusCode, reset2Res.body);

  // Step 6: Verify Gudi@450 works again
  console.log(`\n6. Verifying Gudi@450 works...`);
  const verifyLoginRes = await makeReq('/api/auth/login', 'POST', JSON.stringify({
    email: customerEmail,
    password: 'Gudi@450'
  }));
  console.log('Reverted Login Status:', verifyLoginRes.statusCode, '(Expected 200):', verifyLoginRes.statusCode === 200 ? 'PASS' : 'FAIL');

  // Step 7: Verify Gudi@NewPass2026! now fails with 401
  console.log(`\n7. Verifying Gudi@NewPass2026! now fails...`);
  const verifyOldFail = await makeReq('/api/auth/login', 'POST', JSON.stringify({
    email: customerEmail,
    password: newPassword
  }));
  console.log('Previous Password Login Status:', verifyOldFail.statusCode, '(Expected 401):', verifyOldFail.statusCode === 401 ? 'PASS' : 'FAIL');


  console.log('\n=== TEST 2: ADMIN FORGOT PASSWORD -> RESET -> LOGIN FLOW ===\n');
  const adminEmail = 'admin@primeroute.com';

  console.log(`1. Requesting forgot-password for ${adminEmail}...`);
  const adminForgotRes = await makeReq('/api/auth/forgot-password', 'POST', JSON.stringify({ email: adminEmail }));
  console.log('Admin Forgot Response:', adminForgotRes.statusCode);
  const adminToken = JSON.parse(adminForgotRes.body).resetUrl.match(/token=([^&]+)/)[1];

  const adminNewPass = 'Admin@New2026!';
  console.log(`2. Resetting admin password to ${adminNewPass}...`);
  const adminResetRes = await makeReq('/api/auth/reset-password', 'POST', JSON.stringify({
    token: adminToken,
    newPassword: adminNewPass,
    confirmPassword: adminNewPass
  }));
  console.log('Admin Reset Response:', adminResetRes.statusCode);

  console.log(`3. Testing admin login with OLD password (Password@123)...`);
  const adminOldLogin = await makeReq('/api/auth/login', 'POST', JSON.stringify({ email: adminEmail, password: 'Password@123' }));
  console.log('Admin Old Login Status:', adminOldLogin.statusCode, '(Expected 401):', adminOldLogin.statusCode === 401 ? 'PASS' : 'FAIL');

  console.log(`4. Testing admin login with NEW password (${adminNewPass})...`);
  const adminNewLogin = await makeReq('/api/auth/login', 'POST', JSON.stringify({ email: adminEmail, password: adminNewPass }));
  console.log('Admin New Login Status:', adminNewLogin.statusCode, '(Expected 200):', adminNewLogin.statusCode === 200 ? 'PASS' : 'FAIL');

  // Revert admin password
  console.log(`5. Reverting admin password to Password@123...`);
  const adminForgot2 = await makeReq('/api/auth/forgot-password', 'POST', JSON.stringify({ email: adminEmail }));
  const adminToken2 = JSON.parse(adminForgot2.body).resetUrl.match(/token=([^&]+)/)[1];
  await makeReq('/api/auth/reset-password', 'POST', JSON.stringify({
    token: adminToken2,
    newPassword: 'Password@123',
    confirmPassword: 'Password@123'
  }));
  const adminVerify = await makeReq('/api/auth/login', 'POST', JSON.stringify({ email: adminEmail, password: 'Password@123' }));
  console.log('Admin Reverted Login Status:', adminVerify.statusCode, '(Expected 200):', adminVerify.statusCode === 200 ? 'PASS' : 'FAIL');
}

function makeReq(path, method, data) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (data) headers['Content-Length'] = Buffer.byteLength(data);

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

testCompleteForgotResetLoginFlow().catch(console.error);
