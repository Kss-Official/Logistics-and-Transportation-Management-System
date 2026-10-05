const axios = require('axios');
const { execSync } = require('child_process');

process.env.PGPASSWORD = 'postgres123';

function sql(queryStr) {
  return execSync(`"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -c "${queryStr}"`, {
    env: process.env,
    encoding: 'utf8'
  });
}

async function verify() {
  console.log('=== 1. DATABASE VERIFICATION FOR CUSTOMER 4 ===');
  console.log(sql("SELECT id, email, full_name, role, status FROM users WHERE id = 4;"));
  console.log(sql("SELECT COUNT(*) AS orders_count FROM orders WHERE customer_id = 4;"));
  console.log(sql("SELECT COUNT(*) AS shipments_count FROM shipments s JOIN orders o ON s.order_id = o.id WHERE o.customer_id = 4;"));
  console.log(sql("SELECT COUNT(*) AS invoices_count FROM invoices WHERE customer_id = 4;"));
  console.log(sql("SELECT COUNT(*) AS tracking_events_count FROM shipment_tracking_events WHERE shipment_id IN (SELECT id FROM shipments WHERE order_id IN (SELECT id FROM orders WHERE customer_id = 4));"));
  console.log(sql("SELECT COUNT(*) AS addresses_count FROM addresses WHERE customer_id = 4;"));

  console.log('=== 2. FLEET STATUS VERIFICATION ===');
  console.log(sql("SELECT id, full_name, status, warehouse_id FROM drivers WHERE id IN (13, 15, 16, 17, 19) ORDER BY id;"));
  console.log(sql("SELECT id, vehicle_number, status, warehouse_id FROM vehicles WHERE id IN (8, 9) ORDER BY id;"));

  console.log('=== 3. OTHER CUSTOMERS ORDER COUNTS (PRESERVED) ===');
  console.log(sql("SELECT u.id AS customer_id, u.email, COUNT(o.id) AS order_count FROM users u LEFT JOIN orders o ON o.customer_id = u.id WHERE u.role = 'CUSTOMER' GROUP BY u.id, u.email ORDER BY u.id;"));

  console.log('=== 4. INVENTORY STOCK INTEGRITY ===');
  console.log(sql("SELECT warehouse_id, sku, product_name, total_stock, available_stock, reserved_stock, damaged_stock FROM inventories WHERE warehouse_id = 1 ORDER BY sku;"));

  console.log('=== 5. AUTHENTICATION & API VERIFICATION ===');
  // Customer Login
  try {
    const custLogin = await axios.post('http://localhost:8080/api/auth/login', {
      email: 'shrutisanjanasahoo@gmail.com',
      password: 'User@2026' // or check password
    });
    console.log('Customer API Login: SUCCESS (token length:', (custLogin.data.token || custLogin.data.data?.token)?.length, ')');
  } catch (err) {
    console.log('Customer API Login note:', err.response?.data?.message || err.message);
  }

  // Admin login and check orders
  const adminLogin = await axios.post('http://localhost:8080/api/auth/login', {
    email: 'sanjanaaa.shru@gmail.com',
    password: 'Sanjana@102026'
  });
  const adminToken = adminLogin.data.token || adminLogin.data.data?.token;
  console.log('Admin Login: SUCCESS');

  const adminOrders = await axios.get('http://localhost:8080/api/admin/orders', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const remainingOrders = adminOrders.data.data || adminOrders.data;
  console.log('Total Orders in Admin Portal:', remainingOrders.length);
  const hasCust4Order = remainingOrders.some(o => o.customerEmail === 'shrutisanjanasahoo@gmail.com');
  console.log('Does Admin Portal contain any order for shrutisanjanasahoo@gmail.com?', hasCust4Order ? 'YES (FAILED)' : 'NO (PASSED)');

  // Warehouse Manager check outgoing/incoming
  const wmLogin = await axios.post('http://localhost:8080/api/auth/login', {
    email: 'priya@primeroute.com',
    password: 'Manager@2026!'
  });
  const wmToken = wmLogin.data.token || wmLogin.data.data?.token;
  const wmOut = await axios.get('http://localhost:8080/api/warehouse-manager/shipments/outgoing', {
    headers: { Authorization: `Bearer ${wmToken}` }
  });
  const wmIn = await axios.get('http://localhost:8080/api/warehouse-manager/shipments/incoming', {
    headers: { Authorization: `Bearer ${wmToken}` }
  });
  console.log('Warehouse Outgoing shipments count:', wmOut.data.data.length);
  console.log('Warehouse Incoming shipments count:', wmIn.data.data.length);
  const wmHasCust4Out = wmOut.data.data.some(s => s.customerEmail === 'shrutisanjanasahoo@gmail.com');
  const wmHasCust4In = wmIn.data.data.some(s => s.customerEmail === 'shrutisanjanasahoo@gmail.com');
  console.log('Does Warehouse Outgoing contain Customer 4 shipments?', wmHasCust4Out ? 'YES (FAILED)' : 'NO (PASSED)');
  console.log('Does Warehouse Incoming contain Customer 4 shipments?', wmHasCust4In ? 'YES (FAILED)' : 'NO (PASSED)');
}

verify().catch(console.error);
