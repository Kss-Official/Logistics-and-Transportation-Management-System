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

async function verifyCustomers() {
  const users = [
    { email: 'gudisahoo@gmail.com', password: 'Password@123' },
    { email: 'customer@primeroute.com', password: 'Password@123' },
    { email: 'customer@primeroute.com', password: 'password123' },
  ];

  for (const u of users) {
    const payload = JSON.stringify(u);
    const res = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    }, payload);

    console.log(`Login ${u.email} (${u.password}):`, res.statusCode);
    const token = res.data?.token || res.data?.data?.token;
    if (token) {
      const ordersRes = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/orders',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const parsedOrders = ordersRes.data?.data || ordersRes.data || [];
      const orderNumbers = Array.isArray(parsedOrders) ? parsedOrders.map(o => o.orderNumber) : [];
      console.log(`  Orders count: ${orderNumbers.length}, Contains PR-ORD-29842877: ${orderNumbers.includes('PR-ORD-29842877')}, Contains PR-ORD-74855865: ${orderNumbers.includes('PR-ORD-74855865')}`);

      const invRes = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/customer/invoices',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const parsedInvoices = invRes.data?.data || invRes.data || [];
      const invoiceNumbers = Array.isArray(parsedInvoices) ? parsedInvoices.map(i => i.invoiceNumber) : [];
      console.log(`  Invoices count: ${invoiceNumbers.length}, Contains INV-PR-ORD-29842877: ${invoiceNumbers.includes('INV-PR-ORD-29842877')}, Contains INV-PR-ORD-74855865: ${invoiceNumbers.includes('INV-PR-ORD-74855865')}`);
    }
  }
}

verifyCustomers().catch(console.error);
