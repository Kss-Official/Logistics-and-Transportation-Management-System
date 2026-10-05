const axios = require('axios');

async function testLogin(email, password) {
  try {
    const res = await axios.post('http://localhost:8080/api/auth/login', { email, password });
    console.log(`✓ SUCCESS for ${email} with ${password}`);
    return true;
  } catch (err) {
    console.log(`✗ FAILED for ${email} with ${password}: ${err.response ? err.response.data.message : err.message}`);
    return false;
  }
}

async function main() {
  await testLogin('ramesh@primeroute.com', 'Driver@2026!');
  await testLogin('ramesh@primeroute.com', 'Password@123');
  await testLogin('ramesh@primeroute.com', 'Password@2026!');
  await testLogin('priya.patel@primeroute.in', 'Driver@2026!');
  await testLogin('priya.patel@primeroute.in', 'Password@123');
  await testLogin('priya.patel@primeroute.in', 'Password@2026!');
  await testLogin('admin@primeroute.com', 'Admin@2026!');
}

main();
