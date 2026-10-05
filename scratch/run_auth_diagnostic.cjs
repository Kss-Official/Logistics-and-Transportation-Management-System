const http = require('http');
const { execSync } = require('child_process');

async function testLogin(email, password) {
  const data = JSON.stringify({ email, password });
  return new Promise((resolve) => {
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
      res.on('end', () => resolve({ status: res.statusCode, body: b }));
    });
    req.write(data);
    req.end();
  });
}

async function runDiagnostic() {
  console.log('=== AUTHENTICATION DIAGNOSTIC REPORT ===\n');

  // 1. Check PostgreSQL users table
  console.log('1. Checking Database Users...');
  const psqlQuery = `
    SELECT id, email, role, status, 
           CASE WHEN password LIKE '$2a$%' OR password LIKE '$2b$%' THEN 'BCRYPT_VALID' ELSE 'NOT_BCRYPT' END as pwd_type,
           SUBSTRING(password, 1, 10) as hash_prefix,
           created_at
    FROM users 
    ORDER BY id ASC;
  `;
  const cmd = `powershell -Command "$env:PGPASSWORD = 'postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -c \\"${psqlQuery.replace(/\n/g, ' ')}\\""`;
  const usersRes = execSync(cmd, { encoding: 'utf8' });
  console.log(usersRes);

  // 2. Test Accounts with their respective passwords
  const accountsToTest = [
    { email: 'gudisahoo@gmail.com', pass: 'Gudi@450', role: 'CUSTOMER' },
    { email: 'gudisahoo@gmail.com', pass: 'Password@123', role: 'CUSTOMER (old pass)' },
    { email: 'customer@primeroute.com', pass: 'Password@123', role: 'CUSTOMER' },
    { email: 'admin@primeroute.com', pass: 'Password@123', role: 'ADMIN' },
    { email: 'sanjanaaa.shru@gmail.com', pass: 'Password@123', role: 'ADMIN' },
    { email: 'shrutisanjanasahoo@gmail.com', pass: 'Password@123', role: 'CUSTOMER' },
    { email: 'ramesh@primeroute.com', pass: 'Password@123', role: 'DRIVER' },
    { email: 'priya@primeroute.com', pass: 'Password@123', role: 'WAREHOUSE_MANAGER' },
    { email: 'ccu.east@primeroute.com', pass: 'Password@123', role: 'WAREHOUSE_MANAGER' },
    { email: 'nonexistent@primeroute.com', pass: 'Password@123', role: 'NON_EXISTENT' }
  ];

  console.log('2. Running Live Login Test Cases...');
  for (const acc of accountsToTest) {
    const res = await testLogin(acc.email, acc.pass);
    console.log(`[${acc.role}] ${acc.email} | Result: ${res.status} | Response: ${res.body.slice(0, 150)}`);
  }
}

runDiagnostic().catch(console.error);
