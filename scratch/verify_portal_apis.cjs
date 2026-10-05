const http = require('http');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, headers: res.headers, body, data: JSON.parse(body) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function verifyPortals() {
  console.log('=== VERIFYING API RESPONSES FOR PORTALS ===');

  // 1. Customer Login
  const custPayload = JSON.stringify({ email: 'shrutisanjanasahoo@gmail.com', password: 'Password@123' });
  const custLogin = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(custPayload) }
  }, custPayload);

  console.log('Customer login status:', custLogin.statusCode);
  const custAuth = custLogin.data;
  const custToken = custAuth?.token || custAuth?.data?.token;
  console.log('Customer token exists:', !!custToken);

  if (custToken) {
    // Customer Orders
    const custOrdersRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/orders',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${custToken}` }
    });
    const parsedOrders = custOrdersRes.data?.data || custOrdersRes.data || [];
    const orderNumbers = Array.isArray(parsedOrders) ? parsedOrders.map(o => o.orderNumber) : [];
    console.log(`\nCustomer Orders count: ${orderNumbers.length}`);
    console.log('Customer Orders numbers:', orderNumbers);
    console.log('Contains PR-ORD-29842877:', orderNumbers.includes('PR-ORD-29842877'));
    console.log('Contains PR-ORD-74855865:', orderNumbers.includes('PR-ORD-74855865'));

    // Customer Invoices
    const custInvoicesRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/customer/invoices',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${custToken}` }
    });
    const parsedInvoices = custInvoicesRes.data?.data || custInvoicesRes.data || [];
    const invoiceNumbers = Array.isArray(parsedInvoices) ? parsedInvoices.map(i => i.invoiceNumber) : [];
    console.log(`\nCustomer Invoices count: ${invoiceNumbers.length}`);
    console.log('Customer Invoices numbers:', invoiceNumbers);
    console.log('Contains INV-PR-ORD-29842877:', invoiceNumbers.includes('INV-PR-ORD-29842877'));
    console.log('Contains INV-PR-ORD-74855865:', invoiceNumbers.includes('INV-PR-ORD-74855865'));

    // Customer Shipments
    const custShipmentsRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/shipments',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${custToken}` }
    });
    const parsedShipments = custShipmentsRes.data?.data || custShipmentsRes.data || [];
    const shipmentOrderNumbers = Array.isArray(parsedShipments) ? parsedShipments.map(s => s.orderNumber) : [];
    console.log(`\nCustomer Shipments count: ${shipmentOrderNumbers.length}`);
    console.log('Contains PR-ORD-29842877:', shipmentOrderNumbers.includes('PR-ORD-29842877'));
    console.log('Contains PR-ORD-74855865:', shipmentOrderNumbers.includes('PR-ORD-74855865'));
  }

  // 2. Admin Login
  const adminPayload = JSON.stringify({ email: 'sanjanaaa.shru@gmail.com', password: 'Password@123' });
  const adminLogin = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(adminPayload) }
  }, adminPayload);

  console.log('\nAdmin login status:', adminLogin.statusCode);
  const adminAuth = adminLogin.data;
  const adminToken = adminAuth?.token || adminAuth?.data?.token;
  console.log('Admin token exists:', !!adminToken);

  if (adminToken) {
    // Admin Orders
    const adminOrdersRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/orders',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const allParsedOrders = adminOrdersRes.data?.data || adminOrdersRes.data || [];
    const allOrderNumbers = Array.isArray(allParsedOrders) ? allParsedOrders.map(o => o.orderNumber) : [];
    console.log(`\nAdmin Orders count: ${allOrderNumbers.length}`);
    console.log('Contains PR-ORD-29842877:', allOrderNumbers.includes('PR-ORD-29842877'));
    console.log('Contains PR-ORD-74855865:', allOrderNumbers.includes('PR-ORD-74855865'));

    // Admin Invoices
    const adminInvoicesRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/invoices',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const allParsedInvoices = adminInvoicesRes.data?.data || adminInvoicesRes.data || [];
    const allInvoiceNumbers = Array.isArray(allParsedInvoices) ? allParsedInvoices.map(i => i.invoiceNumber) : [];
    console.log(`\nAdmin Invoices count: ${allInvoiceNumbers.length}`);
    console.log('Contains INV-PR-ORD-29842877:', allInvoiceNumbers.includes('INV-PR-ORD-29842877'));
    console.log('Contains INV-PR-ORD-74855865:', allInvoiceNumbers.includes('INV-PR-ORD-74855865'));

    // Admin Shipments
    const adminShipmentsRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/shipments',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const allParsedShipments = adminShipmentsRes.data?.data || adminShipmentsRes.data || [];
    const allShipmentOrders = Array.isArray(allParsedShipments) ? allParsedShipments.map(s => s.orderNumber) : [];
    console.log(`\nAdmin Shipments count: ${allShipmentOrders.length}`);
    console.log('Contains PR-ORD-29842877:', allShipmentOrders.includes('PR-ORD-29842877'));
    console.log('Contains PR-ORD-74855865:', allShipmentOrders.includes('PR-ORD-74855865'));
  }
}

verifyPortals().catch(console.error);
