const axios = require('axios');

async function testAll() {
  const users = [
    { email: 'admin@primeroute.com', pass: 'Admin@2026!' },
    { email: 'customer@primeroute.com', pass: 'Customer@2026!' },
    { email: 'driver@primeroute.com', pass: 'Driver@2026!' },
    { email: 'rajesh.kumar@primeroute.com', pass: 'Driver@2026!' },
    { email: 'vikram.singh@primeroute.com', pass: 'Driver@2026!' },
    { email: 'amit.sharma@primeroute.com', pass: 'Driver@2026!' },
    { email: 'suresh.patel@primeroute.com', pass: 'Driver@2026!' },
    { email: 'wh.blr@primeroute.com', pass: 'Manager@2026!' },
    { email: 'wh.mum@primeroute.com', pass: 'Manager@2026!' },
    { email: 'wh.del@primeroute.com', pass: 'Manager@2026!' },
  ];

  for (const u of users) {
    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', {
        email: u.email,
        password: u.pass
      });
      console.log(`LOGIN OK: ${u.email} -> Role: ${res.data.role}, Name: ${res.data.fullName}`);
      const token = res.data.token;

      // test notifications
      if (res.data.role === 'ROLE_DRIVER') {
        const notifRes = await axios.get('http://localhost:8080/api/driver/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`  Driver Notifs for ${u.email}:`, notifRes.data);
      }
    } catch (e) {
      console.log(`LOGIN FAIL: ${u.email} -> ${e.response?.data?.message || e.message}`);
    }
  }
}

testAll();
