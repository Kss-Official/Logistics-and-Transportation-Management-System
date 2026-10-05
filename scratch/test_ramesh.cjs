const axios = require('axios');

async function testRamesh() {
  const forgotRes = await axios.post('http://localhost:8080/api/auth/forgot-password', { email: 'ramesh@primeroute.com' });
  const token = new URL(forgotRes.data.resetUrl).searchParams.get('token');
  await axios.post('http://localhost:8080/api/auth/reset-password', {
    token,
    newPassword: 'Driver@2026!',
    confirmPassword: 'Driver@2026!'
  });
  console.log('Ramesh password reset success!');

  const loginRes = await axios.post('http://localhost:8080/api/auth/login', {
    email: 'ramesh@primeroute.com',
    password: 'Driver@2026!'
  });
  console.log('Ramesh logged in:', loginRes.data);

  const notifs = await axios.get('http://localhost:8080/api/driver/notifications', {
    headers: { Authorization: `Bearer ${loginRes.data.token}` }
  });
  console.log('Ramesh notifications:', notifs.data);
}

testRamesh();
