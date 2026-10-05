const axios = require('axios');

async function testLiveDriver() {
  try {
    const loginRes = await axios.post('http://localhost:8080/api/auth/login', {
      email: 'ramesh@primeroute.com',
      password: 'Driver@2026!'
    });
    console.log('Driver login:', loginRes.data.email, loginRes.data.role);
    const token = loginRes.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    const notifs = await axios.get('http://localhost:8080/api/driver/notifications', { headers });
    console.log('Driver notifications count:', notifs.data.data?.length);
    console.log('Driver notifications:', JSON.stringify(notifs.data.data, null, 2));

    const unread = await axios.get('http://localhost:8080/api/driver/notifications/unread-count', { headers });
    console.log('Driver unread count:', unread.data);
  } catch (e) {
    console.log('Error:', e.response?.data || e.message);
  }
}

testLiveDriver();
