const axios = require('axios');

async function main() {
  try {
    const custLogin = await axios.post('http://localhost:8080/api/auth/login', {
      email: 'customer@primeroute.com',
      password: 'Customer@2026!'
    });
    console.log('Customer token acquired:', custLogin.data.data.token.slice(0, 15));
  } catch (e) {
    console.log('Cust login error:', e.response?.data || e.message);
  }
}
main();
