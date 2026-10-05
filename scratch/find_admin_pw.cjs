const axios = require('axios');

async function testAdmin() {
  const common = [
    'admin', 'admin123', 'Admin123', 'Admin@123', 'admin@123', 'Admin123!', 'admin1234', 'Admin@1234',
    'password', 'Password123', 'Password@123', 'Admin@2024!', 'Admin@2025!', 'Admin@2026!',
    'logistics', 'Logistics@123', 'PrimeRoute@123', 'primeroute', '123456', '12345678',
    'secret', 'root', 'manager', 'Customer@2026!'
  ];

  for (const p of common) {
    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', {
        email: 'admin@primeroute.com',
        password: p
      });
      console.log('ADMIN PASSWORD FOUND:', p, res.data);
      return;
    } catch(e) {}
  }
  console.log('Admin password not in common list');
}
testAdmin();
