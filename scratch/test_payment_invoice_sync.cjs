const http = require('http');

async function testApi() {
  console.log('--- Testing API endpoints ---');

  // 1. Test Customer Login
  const custLoginData = JSON.stringify({
    email: 'shrutisanjanasahoo@gmail.com',
    password: 'Password@123'
  });

  const custLoginRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(custLoginData)
    }
  }, custLoginData);

  const custAuth = JSON.parse(custLoginRes.body);
  const custToken = custAuth.token || (custAuth.data && custAuth.data.token);
  console.log('Customer Login Success:', custAuth.email || (custAuth.data && custAuth.data.email), 'Token exists:', !!custToken);

  // 2. Fetch Customer Invoices
  const custInvoicesRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/customer/invoices',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${custToken}`
    }
  });

  console.log('Customer Invoices Status:', custInvoicesRes.statusCode);
  let custInvoices = [];
  try {
    const parsed = JSON.parse(custInvoicesRes.body);
    custInvoices = Array.isArray(parsed) ? parsed : (parsed.data || parsed.content || []);
  } catch (e) {
    console.error('Error parsing customer invoices:', e);
  }
  console.log(`Fetched ${custInvoices.length} customer invoices`);
  
  const targetCustInv = custInvoices.find(inv => inv.orderNumber === 'PR-ORD-10001907' || (inv.invoiceNumber && inv.invoiceNumber.includes('10001907')));
  console.log('Customer Invoice PR-ORD-10001907:', JSON.stringify(targetCustInv, null, 2));

  // 3. Test Admin Login
  const adminLoginData = JSON.stringify({
    email: 'sanjanaaa.shru@gmail.com',
    password: 'Password@123'
  });

  const adminLoginRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(adminLoginData)
    }
  }, adminLoginData);

  const adminAuth = JSON.parse(adminLoginRes.body);
  const adminToken = adminAuth.token || (adminAuth.data && adminAuth.data.token);
  console.log('\nAdmin Login Success:', adminAuth.email || (adminAuth.data && adminAuth.data.email), 'Token exists:', !!adminToken);

  // 4. Fetch Admin Invoices
  const adminInvoicesRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/invoices',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  console.log('Admin Invoices Status:', adminInvoicesRes.statusCode);
  let adminInvoices = [];
  try {
    const parsedAdmin = JSON.parse(adminInvoicesRes.body);
    adminInvoices = Array.isArray(parsedAdmin) ? parsedAdmin : (parsedAdmin.data || parsedAdmin.content || []);
  } catch (e) {
    console.error('Error parsing admin invoices:', e);
  }
  console.log(`Fetched ${adminInvoices.length} admin invoices`);
  
  const targetAdminInv = adminInvoices.find(inv => inv.orderNumber === 'PR-ORD-10001907' || (inv.invoiceNumber && inv.invoiceNumber.includes('10001907')));
  console.log('Admin Invoice PR-ORD-10001907 in Admin list:', JSON.stringify(targetAdminInv, null, 2));

  // 5. Test PDF Download endpoint (Customer & Admin)
  const custPdfRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: `/api/customer/invoices/${targetAdminInv.invoiceNumber}/download`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${custToken}`
    }
  });
  console.log(`Customer Invoice PDF download status: ${custPdfRes.statusCode}, Content-Type: ${custPdfRes.headers['content-type']}, Size: ${custPdfRes.body.length} bytes`);

  const adminPdfRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: `/api/admin/invoices/${targetAdminInv.id}/download`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  console.log(`Admin Invoice PDF download status: ${adminPdfRes.statusCode}, Content-Type: ${adminPdfRes.headers['content-type']}, Size: ${adminPdfRes.body.length} bytes`);

  // 6. Fetch Customer Addresses
  const addrRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/customer/addresses',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${custToken}`
    }
  });
  const parsedAddrs = JSON.parse(addrRes.body);
  const addresses = Array.isArray(parsedAddrs) ? parsedAddrs : (parsedAddrs.data || []);
  console.log(`Fetched ${addresses.length} customer addresses`);

  const pickupAddr = addresses[0] || { id: 1 };
  const deliveryAddr = addresses[1] || addresses[0] || { id: 2 };

  // 7. Test Creating a fresh online order (Express, CARD)
  const newOrderData = JSON.stringify({
    pickupAddressId: pickupAddr.id,
    deliveryAddressId: deliveryAddr.id,
    deliveryType: 'EXPRESS',
    paymentMethod: 'CARD',
    packageDescription: 'Express Electronics Order',
    packageWeight: 2.0,
    packageQuantity: 1
  });

  const createOrderRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/customer/orders',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${custToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(newOrderData)
    }
  }, newOrderData);

  const createdOrderRaw = JSON.parse(createOrderRes.body);
  const createdOrder = createdOrderRaw.data || createdOrderRaw;
  console.log('\nCreated Test Online Order:', createdOrder.orderNumber, 'Payment Status:', createdOrder.paymentStatus);

  // 8. Verify invoice generated for new order
  const newCustInvoicesRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/customer/invoices',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${custToken}`
    }
  });
  const parsedNew = JSON.parse(newCustInvoicesRes.body);
  const newCustInvoices = Array.isArray(parsedNew) ? parsedNew : (parsedNew.data || parsedNew.content || []);
  const newInv = newCustInvoices.find(inv => inv.orderNumber === createdOrder.orderNumber);
  console.log('New Online Order Invoice Details:', JSON.stringify(newInv, null, 2));

  // 9. Test Creating a COD order
  const codOrderData = JSON.stringify({
    pickupAddressId: pickupAddr.id,
    deliveryAddressId: deliveryAddr.id,
    deliveryType: 'STANDARD',
    paymentMethod: 'COD',
    packageDescription: 'Standard Document COD Order',
    packageWeight: 1.0,
    packageQuantity: 1
  });

  const createCodOrderRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/customer/orders',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${custToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(codOrderData)
    }
  }, codOrderData);

  const createdCodOrderRaw = JSON.parse(createCodOrderRes.body);
  const createdCodOrder = createdCodOrderRaw.data || createdCodOrderRaw;
  console.log('\nCreated Test COD Order:', createdCodOrder.orderNumber, 'Payment Status:', createdCodOrder.paymentStatus);

  const afterCodCustInvoicesRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/customer/invoices',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${custToken}`
    }
  });
  const parsedCod = JSON.parse(afterCodCustInvoicesRes.body);
  const afterCodCustInvoices = Array.isArray(parsedCod) ? parsedCod : (parsedCod.data || parsedCod.content || []);
  const codInv = afterCodCustInvoices.find(inv => inv.orderNumber === createdCodOrder.orderNumber);
  console.log('COD Order Invoice Details:', JSON.stringify(codInv, null, 2));
}

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

testApi().catch(console.error);
