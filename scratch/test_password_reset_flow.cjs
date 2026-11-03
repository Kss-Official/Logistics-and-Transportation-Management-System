const http = require('http');
const { execSync } = require('child_process');

process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

function queryDb(sql) {
  return execSync(`${PSQL} -c "${sql}"`, { encoding: 'utf8', env: process.env });
}

function httpPost(path, body) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 8080,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let b = '';
        res.on('data', (c) => (b += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(b) });
          } catch {
            resolve({ status: res.statusCode, raw: b });
          }
        });
      }
    );
    req.on('error', (e) => resolve({ status: 500, error: e.message }));
    req.write(data);
    req.end();
  });
}

async function runStep1to3() {
  const email = 'shrutisanjanasahoo@gmail.com';
  const testPassword = 'TestPersistence@2026!';

  console.log('\n--- 1. Requesting Forgot Password Token ---');
  const forgotRes = await httpPost('/api/auth/forgot-password', { email });
  console.log('Forgot password response:', forgotRes);

  let rawToken = '';
  if (forgotRes.data && forgotRes.data.resetUrl) {
    const url = forgotRes.data.resetUrl;
    rawToken = url.split('token=')[1];
    console.log('Extracted raw token from resetUrl:', rawToken);
  }

  if (!rawToken) {
    console.error('Could not get token from response, query database for token');
    const tokenDb = queryDb(`SELECT token FROM password_reset_tokens WHERE user_id = (SELECT id FROM users WHERE email='${email}') ORDER BY expiry_date DESC LIMIT 1;`);
    console.log('Token in DB:', tokenDb);
  }

  console.log('\n--- 2. Resetting Password ---');
  const resetRes = await httpPost('/api/auth/reset-password', {
    token: rawToken,
    newPassword: testPassword,
    confirmPassword: testPassword,
  });
  console.log('Reset response:', resetRes);

  console.log('\n--- 3. Testing Login BEFORE Restart ---');
  const loginBefore = await httpPost('/api/auth/login', {
    email,
    password: testPassword,
  });
  console.log('Login Before Restart:', loginBefore.status, loginBefore.data ? { email: loginBefore.data.email, role: loginBefore.data.role } : loginBefore.raw);

  console.log('\n--- Database Record Before Restart ---');
  console.log(queryDb(`SELECT id, email, role, status, last_password_change FROM users WHERE email='${email}';`));

  return { email, testPassword };
}

runStep1to3().catch(console.error);
