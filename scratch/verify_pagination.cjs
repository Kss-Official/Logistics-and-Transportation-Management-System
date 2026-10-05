const http = require('http');

async function testApi() {
  console.log('--- Testing Pagination API & State Endpoints ---');
  
  // Test backend endpoints for admin orders, shipments, customers
  const adminAuth = Buffer.from('admin@primeroute.com:admin123').toString('base64');
  
  // Login to get JWT
  const loginData = JSON.stringify({ email: 'sanjanaaa.shru@gmail.com', password: 'Sanjana@102026' });
  
  function request(options, data) {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          resolve({ status: res.statusCode, headers: res.headers, body });
        });
      });
      req.on('error', reject);
      if (data) req.write(data);
      req.end();
    });
  }

  // Check login
  let res = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  }, loginData);

  console.log('Auth login status:', res.status);
  let token = '';
  if (res.status === 200) {
    const parsed = JSON.parse(res.body);
    token = parsed.token || parsed.jwt || parsed.accessToken;
    console.log('JWT obtained successfully:', token ? 'YES' : 'NO');
  }

  if (token) {
    const authHeaders = {
      'Authorization': `Bearer ${token}`
    };

    // 1. Orders
    const ordersRes = await request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/orders',
      method: 'GET',
      headers: authHeaders
    });
    console.log('Admin Orders status:', ordersRes.status);
    const ordersRaw = JSON.parse(ordersRes.body);
    const orders = ordersRaw.data || ordersRaw;
    console.log('Total orders returned:', orders.length);

    // Frontend pagination simulation (pageSize = 8)
    const pageSize = 8;
    const totalPages = Math.ceil(orders.length / pageSize);
    console.log(`Orders Total Pages: ${totalPages}`);
    for (let p = 1; p <= totalPages; p++) {
      const start = (p - 1) * pageSize;
      const end = Math.min(p * pageSize, orders.length);
      const pageSlice = orders.slice(start, start + pageSize);
      console.log(`Page ${p}: Showing ${start + 1}–${end} of ${orders.length} results | Rows rendered: ${pageSlice.length} | First: ${pageSlice[0]?.orderNumber} | Last: ${pageSlice[pageSlice.length - 1]?.orderNumber}`);
    }

    // 2. Shipments
    const shipmentsRes = await request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/shipments',
      method: 'GET',
      headers: authHeaders
    });
    console.log('\nAdmin Shipments status:', shipmentsRes.status);
    const shipmentsRaw = JSON.parse(shipmentsRes.body);
    const shipments = shipmentsRaw.data || shipmentsRaw;
    console.log('Total shipments returned:', shipments.length);
    const totalShipmentPages = Math.ceil(shipments.length / pageSize);
    for (let p = 1; p <= totalShipmentPages; p++) {
      const start = (p - 1) * pageSize;
      const end = Math.min(p * pageSize, shipments.length);
      const pageSlice = shipments.slice(start, start + pageSize);
      console.log(`Shipments Page ${p}: Showing ${start + 1}–${end} of ${shipments.length} results | Rows rendered: ${pageSlice.length} | First: ${pageSlice[0]?.trackingNumber} | Last: ${pageSlice[pageSlice.length - 1]?.trackingNumber}`);
    }

    // 3. Customers
    const customersRes = await request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/customers',
      method: 'GET',
      headers: authHeaders
    });
    console.log('\nAdmin Customers status:', customersRes.status);
    const customersRaw = JSON.parse(customersRes.body);
    const customers = customersRaw.data || customersRaw;
    console.log('Total customers returned:', customers.length);
    const custPageSize = 6;
    const totalCustPages = Math.ceil(customers.length / custPageSize);
    for (let p = 1; p <= totalCustPages; p++) {
      const start = (p - 1) * custPageSize;
      const end = Math.min(p * custPageSize, customers.length);
      const pageSlice = customers.slice(start, start + custPageSize);
      console.log(`Customers Page ${p}: Showing ${start + 1}–${end} of ${customers.length} results | Rows rendered: ${pageSlice.length} | First: ${pageSlice[0]?.fullName || pageSlice[0]?.name}`);
    }
  }
}

testApi().catch(console.error);
