const axios = require('axios');

async function testDriver() {
  try {
    const loginRes = await axios.post('http://localhost:8080/api/auth/login', {
      email: 'driver@primeroute.com',
      password: 'Driver@2026!'
    });
    console.log('Login success! User:', loginRes.data.data.user);
    const token = loginRes.data.data.token;
    
    const notifsRes = await axios.get('http://localhost:8080/api/driver/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Driver notifications response:', notifsRes.data);

    const unreadRes = await axios.get('http://localhost:8080/api/driver/notifications/unread-count', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Driver unread count response:', unreadRes.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

testDriver();
