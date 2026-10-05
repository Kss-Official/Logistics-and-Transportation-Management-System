const axios = require('axios');

async function resetPass(email, newPassword) {
  try {
    const forgotRes = await axios.post('http://localhost:8080/api/auth/forgot-password', { email });
    console.log('Forgot response:', forgotRes.data);
    const resetUrl = forgotRes.data.resetUrl;
    if (!resetUrl) {
      console.log('No resetUrl returned');
      return;
    }
    const token = new URL(resetUrl).searchParams.get('token');
    console.log('Reset token:', token);
    const resetRes = await axios.post('http://localhost:8080/api/auth/reset-password', {
      token,
      newPassword,
      confirmPassword: newPassword
    });
    console.log('Reset response:', resetRes.data);
  } catch (e) {
    console.log('Error:', e.response?.data || e.message);
  }
}

async function run() {
  await resetPass('admin@primeroute.com', 'Admin@2026!');
  await resetPass('driver@primeroute.com', 'Driver@2026!');
  await resetPass('rajesh.kumar@primeroute.com', 'Driver@2026!');
  await resetPass('vikram.singh@primeroute.com', 'Driver@2026!');
  await resetPass('amit.sharma@primeroute.com', 'Driver@2026!');
}
run();
