const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function login(email, password) {
  const res = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email, password });
  return res.data.token || res.data?.data?.token;
}

async function run() {
  console.log('=== TESTING EXISTING SUPPORT APIS ===\n');

  const adminToken = await login('admin@primeroute.com', 'Admin@PrimeRoute2026!');
  const customerToken = await login('customer@primeroute.com', 'Customer@123');

  // 1. Customer Support Contact
  const contactRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/customer/support/contact',
    method: 'GET',
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  console.log('1. GET /api/customer/support/contact ->', contactRes.status, JSON.stringify(contactRes.data?.data));

  // 2. Customer Tickets
  const custTicketsRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/customer/support/tickets',
    method: 'GET',
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  console.log('2. GET /api/customer/support/tickets ->', custTicketsRes.status, `count: ${custTicketsRes.data?.data?.length}`);

  // 3. Admin Tickets
  const adminTicketsRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/support/tickets',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log('3. GET /api/admin/support/tickets ->', adminTicketsRes.status, `count: ${adminTicketsRes.data?.data?.length}`);
  if (adminTicketsRes.data?.data?.length > 0) {
    const firstTicket = adminTicketsRes.data.data[0];
    console.log('   Sample Ticket:', firstTicket.id, firstTicket.ticketNumber, firstTicket.subject, firstTicket.status, firstTicket.customerName);

    // 4. Admin Ticket Messages
    const msgsRes = await request({
      hostname: 'localhost',
      port: 8080,
      path: `/api/admin/support/tickets/${firstTicket.id}/messages`,
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log(`4. GET /api/admin/support/tickets/${firstTicket.id}/messages ->`, msgsRes.status, `count: ${msgsRes.data?.data?.length}`);
  }
}

run().catch(console.error);
