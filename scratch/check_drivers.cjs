const axios = require('axios');

async function check() {
  const emails = [
    'rajesh.kumar@primeroute.com',
    'vikram.singh@primeroute.com',
    'amit.sharma@primeroute.com',
    'suresh.patel@primeroute.com',
    'driver@primeroute.com',
    'admin@primeroute.com'
  ];

  for (const email of emails) {
    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password: email.startsWith('admin') ? 'Admin@2026!' : 'Driver@2026!'
      });
      console.log(`SUCCESS for ${email}:`, res.data.data.user.role, res.data.data.user.fullName);
      
      const token = res.data.data.token;
      if (res.data.data.user.role === 'DRIVER') {
        const notifRes = await axios.get('http://localhost:8080/api/driver/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`  Driver Notifications count: ${notifRes.data.data?.length}`);
        console.log('  Notifications:', JSON.stringify(notifRes.data.data, null, 2));

        const unreadRes = await axios.get('http://localhost:8080/api/driver/notifications/unread-count', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`  Unread count:`, unreadRes.data);
      }
    } catch (err) {
      console.log(`FAILED for ${email}:`, err.response?.data?.message || err.message);
    }
  }
}

check();
