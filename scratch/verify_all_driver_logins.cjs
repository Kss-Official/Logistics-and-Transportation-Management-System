const axios = require('axios');

async function testAllDrivers() {
  const drivers = [
    { email: 'priya.patel@primeroute.in', pass: 'Driver@2026!' },
    { email: 'sneha.kulkarni@primeroute.in', pass: 'Driver@2026!' },
    { email: 'ramesh@primeroute.com', pass: 'Driver@2026!' },
    { email: 'arjun.das@primeroute.in', pass: 'Driver@2026!' }
  ];

  for (const d of drivers) {
    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', {
        email: d.email,
        password: d.pass
      });
      console.log(`[LOGIN SUCCESS] Email: ${d.email} -> Role: ${res.data.role}, Name: ${res.data.name || res.data.fullName}`);
      
      const token = res.data.token || res.data.accessToken;
      if (token) {
        // Test driver deliveries endpoint
        const delivRes = await axios.get('http://localhost:8080/api/driver/deliveries', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`  [DRIVER API] deliveries count = ${delivRes.data.length}`);
      }
    } catch (err) {
      console.error(`[LOGIN ERROR] Email: ${d.email} -> ${err.response ? JSON.stringify(err.response.data) : err.message}`);
    }
  }
}

testAllDrivers();
