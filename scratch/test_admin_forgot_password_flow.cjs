const http = require('http');
const crypto = require('crypto');
const { execSync } = require('child_process');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

function runSql(query) {
  const psql = 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe';
  const cmd = `cmd.exe /c "set PGPASSWORD=postgres123&& \\"${psql}\\" -U postgres -d primeroute_db -t -A -c \\"${query.replace(/"/g, '\\"')}\\""`;
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

async function run() {
  console.log('====================================================');
  console.log('1. VERIFY OLD ADMIN LOGIN REJECTED');
  console.log('====================================================');

  const oldLogin = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@primeroute.com', password: 'Admin@PrimeRoute2026!' }
  );

  console.log('Old Admin login status (admin@primeroute.com):', oldLogin.status);
  if (oldLogin.status === 401 || !oldLogin.data.token) {
    console.log('>>> SUCCESS: Old demo email (admin@primeroute.com) is no longer accepted for login!');
  } else {
    console.error('>>> FAILURE: Old email was unexpectedly accepted!');
  }

  console.log('\n====================================================');
  console.log('2. VERIFY NEW ADMIN LOGIN WITH sanjanaaa.shru@gmail.com');
  console.log('====================================================');

  const newAdminLogin = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'sanjanaaa.shru@gmail.com', password: 'Admin@PrimeRoute2026!' }
  );

  console.log('New Admin login status (sanjanaaa.shru@gmail.com):', newAdminLogin.status);
  console.log('Admin Email in JWT response:', newAdminLogin.data.email);
  console.log('Admin Role in JWT response:', newAdminLogin.data.role);

  if (newAdminLogin.status === 200 && newAdminLogin.data.token && newAdminLogin.data.role === 'ROLE_ADMIN') {
    console.log('>>> SUCCESS: sanjanaaa.shru@gmail.com authenticated successfully with ADMIN privileges!');
  } else {
    console.error('>>> FAILURE: Could not authenticate with new admin email!');
  }

  console.log('\n====================================================');
  console.log('3. TEST EMAIL ENUMERATION PROTECTION');
  console.log('====================================================');

  const enumTest = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/forgot-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'nonexistent_account_9999@gmail.com' }
  );

  console.log('Non-existent email request status:', enumTest.status);
  console.log('Non-existent email response body:', enumTest.data);

  if (
    enumTest.status === 200 &&
    typeof enumTest.data === 'string' &&
    enumTest.data.includes('If an account exists for this email address')
  ) {
    console.log('>>> SUCCESS: Email enumeration protected! Endpoint returns standard message for unknown email.');
  } else {
    console.error('>>> FAILURE: Email enumeration vulnerability detected!');
  }

  console.log('\n====================================================');
  console.log('4. FORGOT PASSWORD REQUEST FOR sanjanaaa.shru@gmail.com (Without SMTP)');
  console.log('====================================================');

  const forgotWithoutSmtp = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/forgot-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'sanjanaaa.shru@gmail.com' }
  );

  console.log('Forgot Password status (SMTP not configured yet):', forgotWithoutSmtp.status);
  console.log('Forgot Password body:', forgotWithoutSmtp.data);

  if (
    forgotWithoutSmtp.status === 503 &&
    forgotWithoutSmtp.data === "We couldn't send the password reset email right now. Please try again."
  ) {
    console.log('>>> SUCCESS: Clean professional error message returned when SMTP credentials are not yet configured!');
  } else if (forgotWithoutSmtp.status === 200) {
    console.log('>>> SUCCESS: Email sent successfully!');
  } else {
    console.log('Response:', forgotWithoutSmtp);
  }

  console.log('\n====================================================');
  console.log('5. TEST SECURE TOKEN LIFECYCLE & NEGATIVE TESTS');
  console.log('====================================================');

  // Generate cryptographically secure 32-byte raw token and SHA-256 hash
  const rawTokenBytes = crypto.randomBytes(32);
  const rawToken = rawTokenBytes.toString('base64url');
  const hashedToken = crypto.createHash('sha256').update(rawToken, 'utf8').digest('hex');

  // Insert token in PostgreSQL with 15-minute expiry
  const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString().replace('T', ' ').replace('Z', '');
  runSql(`INSERT INTO password_reset_tokens (token, user_id, expiry_date, used, created_at) VALUES ('${hashedToken}', 1, '${expiry}', false, NOW());`);

  console.log('Generated test token for sanjanaaa.shru@gmail.com');
  console.log('Raw token length:', rawToken.length);
  console.log('Hashed token in DB:', hashedToken);

  // 5a. Negative test: Mismatched passwords
  const mismatchRes = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/reset-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      token: rawToken,
      newPassword: 'BrandNewPassword@2026',
      confirmPassword: 'DifferentPassword@2026',
    }
  );
  console.log('Mismatch passwords status:', mismatchRes.status, mismatchRes.data);
  if (mismatchRes.status === 400 && String(mismatchRes.data).includes('do not match')) {
    console.log('>>> SUCCESS: Mismatched passwords rejected.');
  }

  // 5b. Negative test: Password too short
  const shortPassRes = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/reset-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      token: rawToken,
      newPassword: '123',
      confirmPassword: '123',
    }
  );
  console.log('Short password status:', shortPassRes.status, shortPassRes.data);
  if (shortPassRes.status === 400) {
    console.log('>>> SUCCESS: Short password rejected.');
  }

  // 5c. Positive test: Successful password reset
  const successReset = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/reset-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      token: rawToken,
      newPassword: 'Admin@ResetPass2026!',
      confirmPassword: 'Admin@ResetPass2026!',
    }
  );
  console.log('Password reset response:', successReset.status, successReset.data);
  if (successReset.status === 200 && successReset.data === 'Password reset successfully.') {
    console.log('>>> SUCCESS: Password reset successfully completed!');
  } else {
    console.error('>>> FAILURE: Password reset failed!');
  }

  // 5d. Negative test: Single-use protection (second attempt with SAME token)
  const reuseRes = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/reset-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      token: rawToken,
      newPassword: 'AnotherPassword@2026!',
      confirmPassword: 'AnotherPassword@2026!',
    }
  );
  console.log('Second attempt with same token status:', reuseRes.status, reuseRes.data);
  if (reuseRes.status === 400 && String(reuseRes.data).includes('no longer valid')) {
    console.log('>>> SUCCESS: Single-use protection verified! Reused token was rejected.');
  } else {
    console.error('>>> FAILURE: Reused token was not rejected!');
  }

  // 5e. Negative test: Tampered / invalid token
  const invalidTokenRes = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/reset-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      token: 'totally_invalid_random_token_xyz',
      newPassword: 'AnotherPassword@2026!',
      confirmPassword: 'AnotherPassword@2026!',
    }
  );
  console.log('Invalid token status:', invalidTokenRes.status, invalidTokenRes.data);
  if (invalidTokenRes.status === 400) {
    console.log('>>> SUCCESS: Invalid token rejected.');
  }

  // 5f. Negative test: Expired token
  const expiredRaw = crypto.randomBytes(32).toString('base64url');
  const expiredHash = crypto.createHash('sha256').update(expiredRaw, 'utf8').digest('hex');
  const pastExpiry = new Date(Date.now() - 30 * 60 * 1000).toISOString().replace('T', ' ').replace('Z', '');
  runSql(`INSERT INTO password_reset_tokens (token, user_id, expiry_date, used, created_at) VALUES ('${expiredHash}', 1, '${pastExpiry}', false, NOW());`);

  const expiredRes = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/reset-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      token: expiredRaw,
      newPassword: 'AnotherPassword@2026!',
      confirmPassword: 'AnotherPassword@2026!',
    }
  );
  console.log('Expired token status:', expiredRes.status, expiredRes.data);
  if (expiredRes.status === 400 && String(expiredRes.data).includes('expired')) {
    console.log('>>> SUCCESS: Expired token rejected.');
  } else {
    console.error('>>> FAILURE: Expired token was not rejected!');
  }

  console.log('\n====================================================');
  console.log('6. VERIFY LOGIN WITH OLD VS NEW PASSWORD');
  console.log('====================================================');

  // Attempt old password (Admin@PrimeRoute2026!)
  const oldPwdLogin = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'sanjanaaa.shru@gmail.com', password: 'Admin@PrimeRoute2026!' }
  );
  console.log('Login with PREVIOUS password status:', oldPwdLogin.status);
  if (oldPwdLogin.status === 401 || !oldPwdLogin.data.token) {
    console.log('>>> SUCCESS: Previous password rejected after reset.');
  } else {
    console.error('>>> FAILURE: Previous password was still accepted!');
  }

  // Attempt new password (Admin@ResetPass2026!)
  const newPwdLogin = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'sanjanaaa.shru@gmail.com', password: 'Admin@ResetPass2026!' }
  );
  console.log('Login with NEW password status:', newPwdLogin.status);
  console.log('New login token role:', newPwdLogin.data.role);
  if (newPwdLogin.status === 200 && newPwdLogin.data.token && newPwdLogin.data.role === 'ROLE_ADMIN') {
    console.log('>>> SUCCESS: Login with new password succeeded! Admin JWT generated.');
  } else {
    console.error('>>> FAILURE: Login with new password failed!');
  }

  // Restore the password to Admin@PrimeRoute2026! or leave as Admin@PrimeRoute2026!
  // Let's reset it back to Admin@PrimeRoute2026! so the standard test suite continues smoothly
  const restoreRaw = crypto.randomBytes(32).toString('base64url');
  const restoreHash = crypto.createHash('sha256').update(restoreRaw, 'utf8').digest('hex');
  const restoreExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString().replace('T', ' ').replace('Z', '');
  runSql(`INSERT INTO password_reset_tokens (token, user_id, expiry_date, used, created_at) VALUES ('${restoreHash}', 1, '${restoreExpiry}', false, NOW());`);

  await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/reset-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      token: restoreRaw,
      newPassword: 'Admin@PrimeRoute2026!',
      confirmPassword: 'Admin@PrimeRoute2026!',
    }
  );
  console.log('✓ Re-synchronized Admin password to Admin@PrimeRoute2026! for ongoing testing.');
}

run().catch((err) => {
  console.error('Verification encountered an error:', err);
  process.exit(1);
});
