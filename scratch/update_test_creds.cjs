const fs = require('fs');

let testScript = fs.readFileSync('scratch/test_admin_portal_e2e.cjs', 'utf8');

testScript = testScript.replace(
  `    const adminRes = await post(\`\${BASE_URL}/api/auth/login\`, {
      email: 'sanjay@primeroute.com',
      password: 'AdminPassword@123',
    });`,
  `    const adminRes = await post(\`\${BASE_URL}/api/auth/login\`, {
      email: 'sanjanaaa.shru@gmail.com',
      password: 'Sanjana@102026',
    });`
);

testScript = testScript.replace(
  `    const custRes = await post(\`\${BASE_URL}/api/auth/login\`, {
      email: 'priya.sharma@example.com',
      password: 'Password@123',
    });`,
  `    const custRes = await post(\`\${BASE_URL}/api/auth/login\`, {
      email: 'customer@primeroute.com',
      password: 'customer123',
    });`
);

testScript = testScript.replace(
  `    const blrRes = await post(\`\${BASE_URL}/api/auth/login\`, {
      email: 'priya@primeroute.com',
      password: 'Manager@2026',
    });`,
  `    const blrRes = await post(\`\${BASE_URL}/api/auth/login\`, {
      email: 'priya@primeroute.com',
      password: 'Manager@2026!',
    });`
);

testScript = testScript.replace(
  `    const mumRes = await post(\`\${BASE_URL}/api/auth/login\`, {
      email: 'mum.west@primeroute.com',
      password: 'Manager@2026',
    });`,
  `    const mumRes = await post(\`\${BASE_URL}/api/auth/login\`, {
      email: 'mum.west@primeroute.com',
      password: 'Manager@2026!',
    });`
);

fs.writeFileSync('scratch/test_admin_portal_e2e.cjs', testScript, 'utf8');
console.log('Updated test_admin_portal_e2e.cjs credentials');
