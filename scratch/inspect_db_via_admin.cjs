const axios = require('axios');

async function checkViaAdmin() {
  try {
    const adminLogin = await axios.post('http://localhost:8080/api/auth/login', {
      email: 'admin@primeroute.com',
      password: 'Admin@2026!'
    });
    console.log('Admin login success!');
    const token = adminLogin.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    const driversRes = await axios.get('http://localhost:8080/api/admin/drivers', { headers });
    console.log('Drivers count:', driversRes.data.data?.length || driversRes.data?.length);
    console.log('Drivers list:', JSON.stringify(driversRes.data.data || driversRes.data, null, 2));

    const shipmentsRes = await axios.get('http://localhost:8080/api/admin/shipments', { headers });
    console.log('Shipments count:', shipmentsRes.data.data?.length || shipmentsRes.data?.length);

  } catch (e) {
    console.log('Error:', e.response?.data || e.message);
  }
}
checkViaAdmin();
