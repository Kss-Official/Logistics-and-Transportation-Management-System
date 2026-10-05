const http = require('http');
const { execSync } = require('child_process');

process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

function query(sql) {
  return execSync(`${PSQL} -c "${sql}"`, { encoding: 'utf8', env: process.env });
}

function post(urlPath, data, token) {
  return new Promise((resolve) => {
    const body = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 8080,
        path: urlPath,
        method: 'POST',
        headers,
      },
      (res) => {
        let b = '';
        res.on('data', (c) => (b += c));
        res.on('end', () => resolve({ status: res.statusCode, body: b }));
      }
    );
    req.on('error', (err) => resolve({ error: err.message }));
    req.write(body);
    req.end();
  });
}

function get(urlPath, token) {
  return new Promise((resolve) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 8080,
        path: urlPath,
        method: 'GET',
        headers,
      },
      (res) => {
        let b = '';
        res.on('data', (c) => (b += c));
        res.on('end', () => resolve({ status: res.statusCode, body: b }));
      }
    );
    req.on('error', (err) => resolve({ error: err.message }));
    req.end();
  });
}

async function run() {
  console.log('====================================================');
  console.log('TEST 1: ADMIN LOGIN & JWT AUTHORIZATION');
  console.log('====================================================');
  const adminLogin = await post('/api/auth/login', {
    email: 'admin@primeroute.com',
    password: 'Admin@PrimeRoute2026!',
  });
  console.log('Admin login status:', adminLogin.status);
  const adminParsed = JSON.parse(adminLogin.body);
  console.log('Admin role returned:', adminParsed.role);
  console.log('Admin JWT generated:', !!adminParsed.token);

  const adminSummary = await get('/api/admin/dashboard/summary', adminParsed.token);
  console.log('GET /api/admin/dashboard/summary status:', adminSummary.status);
  const adminSummaryData = JSON.parse(adminSummary.body).data;
  console.log('Admin dashboard total orders:', adminSummaryData.totalOrders);
  console.log('Admin dashboard total shipments:', adminSummaryData.totalShipments);
  console.log('Admin dashboard status map:', adminSummaryData.ordersByStatus);

  console.log('\n====================================================');
  console.log('TEST 2: CUSTOMER AUTHENTICATION & DASHBOARD STATS');
  console.log('====================================================');
  const custLogin = await post('/api/auth/login', {
    email: 'customer@primeroute.com',
    password: 'Customer@123',
  });
  console.log('Customer login status:', custLogin.status);
  const custParsed = JSON.parse(custLogin.body);
  console.log('Customer role returned:', custParsed.role);

  const custDash = await get('/api/customer/dashboard', custParsed.token);
  console.log('GET /api/customer/dashboard status:', custDash.status);
  const custDashData = JSON.parse(custDash.body).data;
  console.log('Customer dashboard data:');
  console.log('- Total Orders:', custDashData.totalOrders);
  console.log('- Pending Orders:', custDashData.pendingOrders);
  console.log('- Active Shipments:', custDashData.activeShipments);
  console.log('- Delivered Shipments:', custDashData.deliveredShipments);
  console.log('- Orders By Status (distribution map):', custDashData.ordersByStatus);

  console.log('\n====================================================');
  console.log('TEST 3: POSTGRESQL DATA CONSISTENCY CHECK');
  console.log('====================================================');
  console.log('Customer 4 Orders Breakdown:');
  console.log(query(`
    SELECT status, COUNT(*)
    FROM orders
    WHERE customer_id = 4
    GROUP BY status
    ORDER BY status;
  `));

  console.log('Customer 4 Total Orders Count:');
  console.log(query(`
    SELECT COUNT(*) as total_orders
    FROM orders
    WHERE customer_id = 4;
  `));

  console.log('Customer 4 Shipments Breakdown:');
  console.log(query(`
    SELECT s.id, s.tracking_number, s.status as shipment_status, o.order_number, o.status as order_status
    FROM shipments s
    JOIN orders o ON s.order_id = o.id
    WHERE o.customer_id = 4
    ORDER BY s.id;
  `));

  console.log('Customer 2 (customer@primeroute.com) Orders Breakdown:');
  console.log(query(`
    SELECT status, COUNT(*)
    FROM orders
    WHERE customer_id = 2
    GROUP BY status
    ORDER BY status;
  `));
}

run();
