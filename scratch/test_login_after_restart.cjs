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

async function run() {
  const email = 'shrutisanjanasahoo@gmail.com';
  const testPassword = 'TestPersistence@2026!';

  console.log('\n=== TESTING LOGIN AFTER SPRING BOOT RESTART ===');
  const loginRes = await httpPost('/api/auth/login', {
    email,
    password: testPassword,
  });

  console.log('Status Code:', loginRes.status);
  if (loginRes.status === 200) {
    console.log('Login Result: SUCCESS (200 OK)');
    console.log('User Email:', loginRes.data.email);
    console.log('User Role:', loginRes.data.role);
    console.log('JWT Token Generated:', loginRes.data.token ? 'YES (Valid JWT Token Received)' : 'NO');
  } else {
    console.log('Login Result: FAILED (' + loginRes.status + ')', loginRes.data || loginRes.raw);
  }

  console.log('\n=== DATABASE RECORD AFTER RESTART ===');
  console.log(queryDb(`SELECT id, email, role, status, last_password_change FROM users WHERE email='${email}';`));
}

run().catch(console.error);
