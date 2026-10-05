const axios = require('axios');

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:8080/api/auth/login', {
      email: 'priya.patel@primeroute.in',
      password: 'Driver@2026!'
    });
    console.log('STATUS:', res.status);
    console.log('DATA:', res.data);
  } catch (err) {
    console.error('ERROR:', err.response ? err.response.data : err.message);
  }
}

testLogin();
