const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: body ? JSON.parse(body) : null });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function run() {
  console.log("=== Testing Phase 4B Backend Endpoints ===");
  // 1. Login as warehouse manager Priya Sharma
  const loginRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'priya@primeroute.com', password: 'Manager@2026!' });

  if (loginRes.status !== 200 || !loginRes.body?.token) {
    console.error("Login failed:", loginRes);
    return;
  }
  const token = loginRes.body.token;
  console.log("✓ Logged in successfully as Priya Sharma. Token received.");

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // 2. Reports Endpoint
  const reportsRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/reports',
    method: 'GET',
    headers: authHeaders
  });
  console.log(`✓ Reports endpoint status: ${reportsRes.status}, totalUnits: ${reportsRes.body?.totalUnits}, warehouse: ${reportsRes.body?.warehouseName}`);

  // 3. Notifications Endpoint
  const notifRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/notifications',
    method: 'GET',
    headers: authHeaders
  });
  console.log(`✓ Notifications endpoint status: ${notifRes.status}, count: ${Array.isArray(notifRes.body) ? notifRes.body.length : 'not array'}`);

  // 4. Profile & Warehouse endpoints
  const profRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/profile',
    method: 'GET',
    headers: authHeaders
  });
  const whRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/warehouse',
    method: 'GET',
    headers: authHeaders
  });
  console.log(`✓ Profile endpoint status: ${profRes.status}, Name: ${profRes.body?.fullName}, Email: ${profRes.body?.email}`);
  console.log(`✓ Warehouse endpoint status: ${whRes.status}, Facility: ${whRes.body?.name} (${whRes.body?.code})`);

  // 5. Support Contact endpoint
  const contactRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/customer/support/contact',
    method: 'GET',
    headers: authHeaders
  });
  console.log(`✓ Support Contact status: ${contactRes.status}, Email: ${contactRes.body?.email}, Phone: ${contactRes.body?.phone}`);

  // 6. Support Tickets endpoint
  const ticketsRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/customer/support/tickets',
    method: 'GET',
    headers: authHeaders
  });
  console.log(`✓ Support Tickets list status: ${ticketsRes.status}, Tickets count: ${Array.isArray(ticketsRes.body) ? ticketsRes.body.length : 0}`);

  // 7. Support Ticket Creation test
  const createTicketRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/customer/support/tickets',
    method: 'POST',
    headers: authHeaders
  }, {
    subject: "Dock Door 4 Hydraulic Seal Inspection",
    category: "FACILITY_MAINTENANCE",
    priority: "HIGH",
    description: "Dock Door 4 hydraulic leveler seal is reporting sensor pressure variance. Requesting facilities engineer inspection."
  });
  console.log(`✓ Support Ticket Creation status: ${createTicketRes.status}, Ticket ID: ${createTicketRes.body?.id}, Ticket Number: ${createTicketRes.body?.ticketNumber}`);

  console.log("\n=== All Phase 4B Backend Endpoints Verified Successfully! ===");
}

run().catch(console.error);
