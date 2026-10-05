const http = require('http');

async function login(email, password) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, password });
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function getCustomerOrders(token) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/customer/orders',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('--- Logging in as shrutisanjanasahoo@gmail.com ---');
  const loginRes = await login('shrutisanjanasahoo@gmail.com', 'Sanjana@123');
  const token = loginRes.token;
  console.log('User Email:', loginRes.email, 'Name:', loginRes.fullName, 'Role:', loginRes.role);

  if (token) {
    const ordersRes = await getCustomerOrders(token);
    const orderList = Array.isArray(ordersRes) ? ordersRes : (ordersRes.data || []);
    console.log('Total customer orders returned:', orderList.length);
    console.log('Customer orders:');
    orderList.forEach(o => {
      console.log(`- ID: ${o.id}, Number: ${o.orderNumber}, Status: ${o.status}, CreatedAt: ${o.createdAt}`);
    });
  }
}

run().catch(console.error);
