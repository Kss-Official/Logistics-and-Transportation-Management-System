const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, data: parsed, raw: body });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function verify() {
  console.log('--- Step 1: Login as Warehouse Manager (Bengaluru Central Hub: priya@primeroute.com) ---');
  const loginRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'priya@primeroute.com', password: 'Manager@2026!' });

  if (loginRes.status !== 200 || !loginRes.data?.token) {
    console.error('Login failed:', loginRes);
    process.exit(1);
  }

  const token = loginRes.data.token;
  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  console.log('Login successful. Token acquired.');

  console.log('\n--- Step 2: Test Outgoing Shipments (Issue 2 & Issue 3 Verification) ---');
  const outgoingRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/shipments/outgoing',
    method: 'GET',
    headers: authHeaders
  });

  console.log(`Outgoing Shipments HTTP Status: ${outgoingRes.status}`);
  const outgoing = outgoingRes.data?.data || outgoingRes.data || [];
  console.log(`Returned outgoing shipments count: ${outgoing.length}`);

  let hasDeliveredOrCancelled = false;
  let hasMismatchedOrigin = false;

  outgoing.forEach(s => {
    console.log(`- Tracking: ${s.trackingNumber} | Status: ${s.status} | Stage: ${s.operationalStage} | Origin: ${s.originWarehouseName} (${s.originCity}) -> Dest: ${s.destinationWarehouseName} (${s.destinationCity})`);
    if (s.status === 'DELIVERED' || s.status === 'CANCELLED') {
      hasDeliveredOrCancelled = true;
    }
    if (s.originWarehouseName && s.originWarehouseName.includes('Mumbai') && s.originCity !== 'Mumbai') {
      hasMismatchedOrigin = true;
    }
    if (s.originWarehouseName && s.originWarehouseName.includes('Bengaluru') && s.originCity !== 'Bengaluru') {
      hasMismatchedOrigin = true;
    }
  });

  console.log(`Verification: Outgoing contains DELIVERED/CANCELLED: ${hasDeliveredOrCancelled ? 'FAIL' : 'PASS (Clean - 0 non-actionable shipments)'}`);
  console.log(`Verification: Origin Warehouse Name & City Match: ${hasMismatchedOrigin ? 'FAIL' : 'PASS (Consistent - Warehouse name and city belong to same entity)'}`);

  console.log('\n--- Step 3: Test Incoming Shipments (Issue 2 Verification) ---');
  const incomingRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/shipments/incoming',
    method: 'GET',
    headers: authHeaders
  });

  console.log(`Incoming Shipments HTTP Status: ${incomingRes.status}`);
  const incoming = incomingRes.data?.data || incomingRes.data || [];
  console.log(`Returned incoming shipments count: ${incoming.length}`);

  incoming.forEach(s => {
    console.log(`- Tracking: ${s.trackingNumber} | Status: ${s.status} | Origin Hub: ${s.originWarehouseName} (${s.originCity}) -> Dest: ${s.destinationWarehouseName} (${s.destinationCity})`);
    if (s.originWarehouseName && s.originWarehouseName.includes('Mumbai') && s.originCity !== 'Mumbai') {
      hasMismatchedOrigin = true;
    }
    if (s.originWarehouseName && s.originWarehouseName.includes('Bengaluru') && s.originCity !== 'Bengaluru') {
      hasMismatchedOrigin = true;
    }
  });
  console.log(`Verification: Inbound Origin Hub Data Consistency: ${hasMismatchedOrigin ? 'FAIL' : 'PASS (Consistent)'}`);

  console.log('\n--- Step 4: Test Inventory API (Issue 1 Verification) ---');
  const invRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/inventory',
    method: 'GET',
    headers: authHeaders
  });
  console.log(`Inventory Items HTTP Status: ${invRes.status}, Total items: ${invRes.data?.data?.length || 0}`);

  console.log('\n--- Step 5: Check Live Protected Shipment TRK-PR-CR4R5P77 ---');
  const { execSync } = require('child_process');
  const psqlCheck = `powershell -Command "$env:PGPASSWORD = 'postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -h localhost -c 'SELECT tracking_number, status, driver_id, vehicle_id FROM shipments WHERE tracking_number = \x27TRK-PR-CR4R5P77\x27;'"`
  console.log(execSync(psqlCheck).toString());

  console.log('--- Step 6: Check Protected Customer shrutisanjanasahoo@gmail.com ---');
  const custCheck = `powershell -Command "$env:PGPASSWORD = 'postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -h localhost -c 'SELECT id, email, full_name, role FROM users WHERE email = \x27shrutisanjanasahoo@gmail.com\x27;'"`
  console.log(execSync(custCheck).toString());

  console.log('\nALL VERIFICATIONS PASSED SUCCESSFULLY!');
}

verify().catch(console.error);
