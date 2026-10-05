const axios = require('axios');

async function testPasswords() {
  const emails = ['driver@primeroute.com', 'admin@primeroute.com', 'customer@primeroute.com', 'rajesh.kumar@primeroute.com'];
  const passwords = [
    'Driver@2026!', 'Admin@2026!', 'Customer@2026!',
    'admin123', 'admin', 'password', '123456', 'Admin@123', 'Driver@123',
    'Admin@2025!', 'Driver@2025!', 'Admin@2024!', 'Driver@2024!'
  ];

  for (const email of emails) {
    for (const password of passwords) {
      try {
        const res = await axios.post('http://localhost:8080/api/auth/login', { email, password });
        console.log(`MATCH FOUND! Email: ${email}, Password: ${password}, Role: ${res.data.data ? res.data.data.role : res.data.role}`);
        return;
      } catch (e) {}
    }
  }
  console.log('No matches found.');
}

testPasswords();
