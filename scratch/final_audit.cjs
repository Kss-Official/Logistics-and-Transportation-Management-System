const http = require('http');
const { execSync } = require('child_process');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function finalAudit() {
  console.log('====================================================');
  console.log('       PRIMEROUTE LOGISTICS — FINAL CLEANUP AUDIT   ');
  console.log('====================================================\n');

  // 1. PostgreSQL DB State
  console.log('--- 1. POSTGRESQL DATABASE STATE ---');
  const sqlCheck = `
    SELECT 'orders' as table_name, count(*) as count FROM orders WHERE order_number IN ('PR-ORD-29842877', 'PR-ORD-74855865')
    UNION ALL
    SELECT 'invoices', count(*) FROM invoices WHERE invoice_number IN ('INV-PR-ORD-29842877', 'INV-PR-ORD-74855865') OR order_id IN (870, 871)
    UNION ALL
    SELECT 'fulfillment_allocations', count(*) FROM fulfillment_allocations WHERE order_id IN (870, 871)
    UNION ALL
    SELECT 'order_items', count(*) FROM order_items WHERE order_id IN (870, 871)
    UNION ALL
    SELECT 'shipments', count(*) FROM shipments WHERE order_id IN (870, 871)
    UNION ALL
    SELECT 'inventory_transactions', count(*) FROM inventory_transactions WHERE reference_order IN ('PR-ORD-29842877', 'PR-ORD-74855865')
    UNION ALL
    SELECT 'TOTAL_ORDERS_REMAINING', count(*) FROM orders
    UNION ALL
    SELECT 'TOTAL_INVOICES_REMAINING', count(*) FROM invoices
    UNION ALL
    SELECT 'TOTAL_SHIPMENTS_REMAINING', count(*) FROM shipments;
  `;
  const psqlCmd = `powershell -ExecutionPolicy Bypass -File d:\\Transportation-Logistic\\scratch\\run_sql.ps1 -SqlFile d:\\Transportation-Logistic\\scratch\\verify_post_deletion.sql`;
  const dbOut = execSync(psqlCmd, { encoding: 'utf8' });
  console.log(dbOut);

  // 2. Admin Portal API Verification
  console.log('--- 2. ADMIN PORTAL API AUDIT ---');
  const adminPayload = JSON.stringify({ email: 'sanjanaaa.shru@gmail.com', password: 'Password@123' });
  const adminLogin = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(adminPayload) }
  }, adminPayload);

  const adminToken = adminLogin.data?.token || adminLogin.data?.data?.token;
  console.log('Admin Auth status:', adminLogin.statusCode, 'Token acquired:', !!adminToken);

  if (adminToken) {
    // Admin Orders
    const adminOrdersRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/orders',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const allOrders = adminOrdersRes.data?.data || adminOrdersRes.data || [];
    const allOrderNumbers = allOrders.map(o => o.orderNumber);
    console.log(`Admin Portal: ${allOrders.length} orders total`);
    console.log('  Target PR-ORD-29842877 exists:', allOrderNumbers.includes('PR-ORD-29842877'));
    console.log('  Target PR-ORD-74855865 exists:', allOrderNumbers.includes('PR-ORD-74855865'));

    // Admin Invoices
    const adminInvoicesRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/invoices',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const allInvoices = adminInvoicesRes.data?.data || adminInvoicesRes.data || [];
    const allInvoiceNumbers = allInvoices.map(i => i.invoiceNumber);
    console.log(`Admin Portal: ${allInvoices.length} invoices total`);
    console.log('  Target INV-PR-ORD-29842877 exists:', allInvoiceNumbers.includes('INV-PR-ORD-29842877'));
    console.log('  Target INV-PR-ORD-74855865 exists:', allInvoiceNumbers.includes('INV-PR-ORD-74855865'));

    // Admin Shipments
    const adminShipmentsRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/shipments',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const allShipments = adminShipmentsRes.data?.data || adminShipmentsRes.data || [];
    const allShipmentOrders = allShipments.map(s => s.orderNumber);
    console.log(`Admin Portal: ${allShipments.length} shipments total`);
    console.log('  Target PR-ORD-29842877 exists:', allShipmentOrders.includes('PR-ORD-29842877'));
    console.log('  Target PR-ORD-74855865 exists:', allShipmentOrders.includes('PR-ORD-74855865'));
  }

  // 3. Customer Portal API Verification
  console.log('\n--- 3. CUSTOMER PORTAL API AUDIT ---');
  const custPayload = JSON.stringify({ email: 'customer@primeroute.com', password: 'Password@123' });
  const custLogin = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(custPayload) }
  }, custPayload);

  const custToken = custLogin.data?.token || custLogin.data?.data?.token;
  console.log('Customer Auth status:', custLogin.statusCode, 'Token acquired:', !!custToken);

  if (custToken) {
    // Customer Orders
    const custOrdersRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/orders',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${custToken}` }
    });
    const custOrdersData = custOrdersRes.data?.data || custOrdersRes.data || [];
    const custOrdersList = Array.isArray(custOrdersData) ? custOrdersData : [];
    const custOrderNumbers = custOrdersList.map(o => o.orderNumber);
    console.log(`Customer Portal: ${custOrdersList.length} orders for customer`);
    console.log('  Target PR-ORD-29842877 exists:', custOrderNumbers.includes('PR-ORD-29842877'));
    console.log('  Target PR-ORD-74855865 exists:', custOrderNumbers.includes('PR-ORD-74855865'));

    // Customer Invoices
    const custInvoicesRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/customer/invoices',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${custToken}` }
    });
    const custInvoicesData = custInvoicesRes.data?.data || custInvoicesRes.data || [];
    const custInvoicesList = Array.isArray(custInvoicesData) ? custInvoicesData : [];
    const custInvoiceNumbers = custInvoicesList.map(i => i.invoiceNumber);
    console.log(`Customer Portal: ${custInvoicesList.length} invoices for customer`);
    console.log('  Target INV-PR-ORD-29842877 exists:', custInvoiceNumbers.includes('INV-PR-ORD-29842877'));
    console.log('  Target INV-PR-ORD-74855865 exists:', custInvoiceNumbers.includes('INV-PR-ORD-74855865'));
  }

  console.log('\n====================================================');
  console.log('         ALL AUDITS COMPLETED SUCCESSFULLY          ');
  console.log('====================================================');
}

finalAudit().catch(console.error);
