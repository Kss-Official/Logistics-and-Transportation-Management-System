const http = require('http');

http.get('http://localhost:5173/src/pages/customer/CustomerDashboard.tsx', (res) => {
  let b = '';
  res.on('data', c => b += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Length:', b.length);
    console.log('Contains deliveredShipments:', b.includes('deliveredShipments'));
  });
}).on('error', err => console.error(err.message));
