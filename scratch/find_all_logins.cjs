const axios = require('axios');

async function testDrivers() {
  const emails = [
    'driver@primeroute.com',
    'driver.blr@primeroute.com',
    'driver.del@primeroute.com',
    'driver.mum@primeroute.com',
    'rajesh.kumar@primeroute.com',
    'vikram.singh@primeroute.com',
    'amit.sharma@primeroute.com',
    'suresh.patel@primeroute.com',
    'priya.sharma@primeroute.com',
    'driver1@primeroute.com',
    'admin@primeroute.com',
    'admin@logistics.com'
  ];
  const passwords = [
    'Driver@2026!', 'Driver@123', 'Driver@2025!', 'Driver@1234', 'driver123',
    'Admin@2026!', 'Admin@123', 'Admin@2025!', 'Admin@1234', 'admin123',
    'Password@123', 'Password@2026!', 'PrimeRoute@2026!', 'PrimeRoute@123'
  ];

  for (const email of emails) {
    for (const password of passwords) {
      try {
        const res = await axios.post('http://localhost:8080/api/auth/login', { email, password });
        console.log(`MATCH FOUND! Email: ${email}, Password: ${password}, Response:`, res.data);
      } catch (e) {}
    }
  }
}

testDrivers();
