const http = require('http');

// First login to get token
const loginData = JSON.stringify({
  email: 'customer@primeroute.com',
  password: 'Customer@2026!'
});

const req = http.request({
  hostname: 'localhost',
  port: 8080,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      const token = json.token || json.data?.token;
      console.log('Login success. Token acquired:', token?.substring(0, 20));

      // Test quote for STANDARD, EXPRESS, SAME_DAY
      ['STANDARD', 'EXPRESS', 'SAME_DAY'].forEach(deliveryType => {
        const quoteData = JSON.stringify({
          pickupAddressId: 1,
          deliveryAddressId: 2,
          packageWeight: 2.1,
          packageQuantity: 1,
          deliveryType: deliveryType
        });

        const qReq = http.request({
          hostname: 'localhost',
          port: 8080,
          path: '/api/orders/quote',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': quoteData.length,
            'Authorization': `Bearer ${token}`
          }
        }, (qRes) => {
          let qBody = '';
          qRes.on('data', c => qBody += c);
          qRes.on('end', () => {
            const q = JSON.parse(qBody);
            console.log(`\n[${deliveryType} Quote]:`, q);
          });
        });
        qReq.write(quoteData);
        qReq.end();
      });
    } catch(e) {
      console.error('Error parsing login response:', body);
    }
  });
});

req.write(loginData);
req.end();
