const { execSync } = require('child_process');
const http = require('http');

process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

function query(sql) {
  return execSync(`${PSQL} -c "${sql}"`, { encoding: 'utf8', env: process.env });
}

async function testHttpLogin(email, password) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ email, password });
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        resolve({ status: res.statusCode, body: b });
      });
    });
    req.on('error', (e) => resolve({ status: 500, error: e.message }));
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('=== USERS TABLE ===');
  console.log(query('SELECT id, email, role, status FROM users ORDER BY id;'));

  console.log('=== TESTING RAMESH LOGIN ===');
  const res1 = await testHttpLogin('ramesh@primeroute.com', ' Driver@2026!');
  console.log('With space (" Driver@2026!"):', res1.status, res1.body);

  const res2 = await testHttpLogin('ramesh@primeroute.com', 'Driver@2026!');
  console.log('Without space ("Driver@2026!"):', res2.status, res2.body.substring(0, 100));

  console.log('=== TESTING SHRUTI LOGIN ===');
  const res3 = await testHttpLogin('shrutisanjanasahoo@gmail.com', 'Shruti@23');
  console.log('Shruti with "Shruti@23":', res3.status, res3.body);
  const res3b = await testHttpLogin('shrutisanjanasahoo@gmail.com', 'Driver@2026!');
  console.log('Shruti with "Driver@2026!":', res3b.status, res3b.body.substring(0, 100));
  const res4 = await testHttpLogin('shrutisanjanasahoo@gmail.com', 'Password@123');
  console.log('Shruti with "Password@123":', res4.status, res4.body);
}

main().catch(console.error);
