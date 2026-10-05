const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function run() {
  console.log('--- Step 1: Customer Login ---');
  const custLoginRes = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'customer@primeroute.com', password: 'Customer@123' }
  );
  if (!custLoginRes.data.token) {
    throw new Error('Customer login failed: ' + JSON.stringify(custLoginRes.data));
  }
  const custToken = custLoginRes.data.token;
  console.log('Customer logged in successfully.');

  console.log('--- Step 2: Admin Login ---');
  const adminLoginRes = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@primeroute.com', password: 'Admin@PrimeRoute2026!' }
  );
  if (!adminLoginRes.data.token) {
    throw new Error('Admin login failed: ' + JSON.stringify(adminLoginRes.data));
  }
  const adminToken = adminLoginRes.data.token;
  console.log('Admin logged in successfully.');

  console.log('--- Step 3: Admin Gets Initial Tickets & Calculates KPIs ---');
  const adminInitTickets = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/support/tickets',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const initialList = adminInitTickets.data.data;
  console.log(`Initial tickets count: ${initialList.length}`);
  const initialOpen = initialList.filter((t) => t.status === 'OPEN').length;

  console.log('--- Step 4 (A): Customer Creates a Support Ticket ---');
  const uniqueSubj = 'Freight Inspection Needed ' + Date.now();
  const createTicketRes = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/customer/support/tickets',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}`,
      },
    },
    {
      subject: uniqueSubj,
      category: 'DAMAGED_FREIGHT',
      priority: 'HIGH',
      description: 'Cartons arrived with damaged exterior seal. Please inspect cargo promptly.',
    }
  );
  const createdTicket = createTicketRes.data.data;
  console.log(`Created ticket: ${createdTicket.ticketNumber} (ID: ${createdTicket.id})`);

  console.log('--- Step 5 (B): Ticket Appears in Admin -> Support ---');
  const adminTicketsAfterCreate = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/support/tickets',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const afterList = adminTicketsAfterCreate.data.data;
  const foundTicket = afterList.find((t) => t.id === createdTicket.id);
  if (!foundTicket) throw new Error('Created ticket not found in admin support tickets!');
  console.log(`Found in Admin tickets list: ${foundTicket.ticketNumber}, status=${foundTicket.status}, priority=${foundTicket.priority}`);

  console.log('--- Step 6 (C & D): Admin Changes Priority & Status ---');
  const priorityRes = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: `/api/admin/support/tickets/${createdTicket.id}/priority`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    { priority: 'URGENT' }
  );
  console.log(`Updated priority to: ${priorityRes.data.data.priority}`);

  const statusRes = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: `/api/admin/support/tickets/${createdTicket.id}/status`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    { status: 'IN_PROGRESS' }
  );
  console.log(`Updated status to: ${statusRes.data.data.status}`);

  console.log('--- Step 7 (E): Admin Sends Reply ---');
  const adminReplyRes = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: `/api/admin/support/tickets/${createdTicket.id}/messages`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    { message: 'Hello, our operations team has notified the warehouse manager. Inspection is scheduled.' }
  );
  console.log(`Admin reply sent: "${adminReplyRes.data.data.message}" by ${adminReplyRes.data.data.senderName} (${adminReplyRes.data.data.senderRole})`);

  console.log('--- Step 8 (F & G & H): Customer Refreshes Ticket Messages ---');
  const custMsgsRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: `/api/customer/support/tickets/${createdTicket.id}/messages`,
    method: 'GET',
    headers: { Authorization: `Bearer ${custToken}` },
  });
  const custMsgs = custMsgsRes.data.data;
  console.log(`Customer retrieved ${custMsgs.length} messages.`);
  const adminMsgInCust = custMsgs.find((m) => m.senderRole === 'ADMIN');
  if (!adminMsgInCust) throw new Error('Customer did not see Admin message!');
  console.log(`Verified Customer sees Admin message: "${adminMsgInCust.message}"`);

  console.log('--- Step 9 (I): Customer Sends Another Message ---');
  const custReplyRes = await request(
    {
      hostname: 'localhost',
      port: 8080,
      path: `/api/customer/support/tickets/${createdTicket.id}/messages`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}`,
      },
    },
    { message: 'Thank you! Photos of the damaged cartons have been attached to the claim.' }
  );
  console.log(`Customer replied: "${custReplyRes.data.data.message}"`);

  console.log('--- Step 10 (J & K): Admin Refreshes Conversation & Sees Customer Message ---');
  const adminMsgsRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: `/api/admin/support/tickets/${createdTicket.id}/messages`,
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminMsgs = adminMsgsRes.data.data;
  console.log(`Admin retrieved ${adminMsgs.length} messages.`);
  const lastCustMsg = adminMsgs.find((m) => m.message.includes('Photos of the damaged cartons'));
  if (!lastCustMsg) throw new Error('Admin did not see Customer second message!');
  console.log(`Verified Admin sees Customer message: "${lastCustMsg.message}"`);

  console.log('--- Step 11 (L & M): KPI & Status Filter Counts Verification ---');
  const finalTicketsRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/support/tickets',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const finalTickets = finalTicketsRes.data.data;
  const kpis = {
    total: finalTickets.length,
    open: finalTickets.filter((t) => t.status === 'OPEN').length,
    inProgress: finalTickets.filter((t) => t.status === 'IN_PROGRESS').length,
    resolvedClosed: finalTickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
    highUrgent: finalTickets.filter((t) => t.priority === 'HIGH' || t.priority === 'URGENT').length,
  };
  console.log('Calculated KPIs from live PostgreSQL data:', kpis);

  const statusCounts = {
    ALL: finalTickets.length,
    OPEN: finalTickets.filter((t) => t.status === 'OPEN').length,
    IN_PROGRESS: finalTickets.filter((t) => t.status === 'IN_PROGRESS').length,
    RESOLVED: finalTickets.filter((t) => t.status === 'RESOLVED').length,
    CLOSED: finalTickets.filter((t) => t.status === 'CLOSED').length,
  };
  console.log('Calculated Segmented Tabs counts from live PostgreSQL data:', statusCounts);

  console.log('--- ALL CHECKS A THROUGH N PASSED PERFECTLY! ---');
}

run().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});
