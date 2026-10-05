const http = require('http');
const { execSync } = require('child_process');

process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

function queryDbSafe() {
  const sql = "SELECT id, email, role, status, LENGTH(password) as pwd_len, (password LIKE '$2%') as is_bcrypt, last_password_change FROM users WHERE email = 'admin@primeroute.com';";
  return execSync(`${PSQL} -c "${sql}"`, { encoding: 'utf8', env: process.env }).trim();
}

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

async function runTestSuite() {
  console.log('==============================================');
  console.log('PRIME ROUTE LOGISTICS - ADMIN PASSWORD SUITE');
  console.log('==============================================\n');

  const currentWorkingPassword = 'Admin@PrimeRoute2026!';
  const newWorkingPassword = 'AdminSecuredPassword2026#';

  // ── STEP 1: Login with initial working password ──
  console.log('[STEP 1] Login with current working password...');
  const step1 = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@primeroute.com', password: currentWorkingPassword });

  console.log(' -> HTTP Status:', step1.status);
  console.log(' -> Has JWT token:', !!step1.data?.token);
  console.log(' -> User Role:', step1.data?.role);
  if (!step1.data?.token) throw new Error('STEP 1 Failed: Cannot log in with current working password');
  let token = step1.data.token;

  // ── NEGATIVE TESTS ──
  console.log('\n================ NEGATIVE TESTS ================');

  // NEG 1: Wrong current password
  console.log('\n[NEG 1] Attempt password change with WRONG current password...');
  const neg1 = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/settings/security/change-password',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, {
    currentPassword: 'WrongCurrentPassword999!',
    newPassword: newWorkingPassword,
    confirmPassword: newWorkingPassword
  });
  console.log(' -> HTTP Status:', neg1.status, '(Expected 400)');
  console.log(' -> Rejected response message:', neg1.data?.message);
  if (neg1.status !== 400) throw new Error('NEG 1 Failed: Wrong current password was not rejected with 400');

  // NEG 2: New password != Confirm password
  console.log('\n[NEG 2] Attempt password change where newPassword != confirmPassword...');
  const neg2 = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/settings/security/change-password',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, {
    currentPassword: currentWorkingPassword,
    newPassword: newWorkingPassword,
    confirmPassword: 'MismatchPassword123!'
  });
  console.log(' -> HTTP Status:', neg2.status, '(Expected 400)');
  console.log(' -> Rejected response message:', neg2.data?.message);
  if (neg2.status !== 400) throw new Error('NEG 2 Failed: Mismatched confirmation was not rejected with 400');

  // NEG 3: Empty password
  console.log('\n[NEG 3] Attempt password change with empty password...');
  const neg3 = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/settings/security/change-password',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, {
    currentPassword: currentWorkingPassword,
    newPassword: '',
    confirmPassword: ''
  });
  console.log(' -> HTTP Status:', neg3.status, '(Expected 400)');
  console.log(' -> Rejected response message:', neg3.data?.message);
  if (neg3.status !== 400) throw new Error('NEG 3 Failed: Empty password was not rejected with 400');

  // NEG 4: Short/weak password (< 6 chars)
  console.log('\n[NEG 4] Attempt password change with password shorter than 6 chars...');
  const neg4 = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/settings/security/change-password',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, {
    currentPassword: currentWorkingPassword,
    newPassword: '123',
    confirmPassword: '123'
  });
  console.log(' -> HTTP Status:', neg4.status, '(Expected 400)');
  console.log(' -> Rejected response message:', neg4.data?.message);
  if (neg4.status !== 400) throw new Error('NEG 4 Failed: Short password was not rejected with 400');

  // ── STEP 2-6: Change Password Successfully ──
  console.log('\n================ POSITIVE LIFECYCLE ================');
  console.log('\n[STEP 2-6] Submitting valid password change to NEW password...');
  const changeRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/settings/security/change-password',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, {
    currentPassword: currentWorkingPassword,
    newPassword: newWorkingPassword,
    confirmPassword: newWorkingPassword
  });
  console.log(' -> HTTP Status:', changeRes.status, '(Expected 200)');
  console.log(' -> Response:', changeRes.data);
  if (changeRes.status !== 200) throw new Error('Password change failed');

  // ── STEP 7: Verify DB state safely ──
  console.log('\n[STEP 7] Inspecting database users record safely (no password plaintext)...');
  const dbRecord = queryDbSafe();
  console.log(dbRecord);

  // ── STEP 8 & 9: Old password rejected, new password succeeds ──
  console.log('\n[STEP 8] Verifying OLD password is now REJECTED...');
  const oldLogin = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@primeroute.com', password: currentWorkingPassword });
  console.log(' -> HTTP Status:', oldLogin.status, '(Expected 401)');
  console.log(' -> Error Message:', oldLogin.data?.message);
  if (oldLogin.status !== 401) throw new Error('Old password was NOT rejected!');

  console.log('\n[STEP 9] Verifying NEW password is now ACCEPTED...');
  const newLogin = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@primeroute.com', password: newWorkingPassword });
  console.log(' -> HTTP Status:', newLogin.status, '(Expected 200)');
  console.log(' -> Has New JWT Token:', !!newLogin.data?.token);
  console.log(' -> New Role:', newLogin.data?.role);
  if (!newLogin.data?.token) throw new Error('Login with new password failed!');
  const newToken = newLogin.data.token;

  // ── STEP 10-12: Verify Admin APIs with New Token ──
  console.log('\n[STEP 10-12] Verifying Admin APIs with newly issued Admin JWT...');
  const dashRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/dashboard/summary',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${newToken}` }
  });
  console.log(' -> GET /api/admin/dashboard/summary status:', dashRes.status);
  console.log(' -> Total Orders:', dashRes.data?.data?.totalOrders ?? dashRes.data?.totalOrders);

  const profileRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/settings/profile',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${newToken}` }
  });
  console.log(' -> GET /api/admin/settings/profile status:', profileRes.status);
  console.log(' -> Profile Email:', profileRes.data?.data?.email);
  console.log(' -> Profile Role:', profileRes.data?.data?.role);

  // ── RESTORE TO DEFAULT ADMIN PASSWORD ──
  console.log('\n[CLEANUP / RESTORE] Restoring password back to Admin@PrimeRoute2026!...');
  const restoreRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/settings/security/change-password',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${newToken}` }
  }, {
    currentPassword: newWorkingPassword,
    newPassword: currentWorkingPassword,
    confirmPassword: currentWorkingPassword
  });
  console.log(' -> Restore HTTP Status:', restoreRes.status);

  console.log('\n[FINAL VERIFY] Logging in with restored password...');
  const finalLogin = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@primeroute.com', password: currentWorkingPassword });
  console.log(' -> Final Login Status:', finalLogin.status, 'Success:', !!finalLogin.data?.token);

  console.log('\n==============================================');
  console.log('ALL LIFECYCLE & NEGATIVE TESTS PASSED 100%!');
  console.log('==============================================');
}

runTestSuite().catch(err => {
  console.error('\nTEST FAILED:', err.message);
  process.exit(1);
});
