const http = require('http');

function req(options, data) {
  return new Promise((resolve, reject) => {
    const r = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: body ? JSON.parse(body) : null });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    r.on('error', reject);
    if (data) r.write(typeof data === 'string' ? data : JSON.stringify(data));
    r.end();
  });
}

async function run() {
  console.log("==================================================");
  console.log("PRIMEROUTE LOGISTICS — PHASE 4C REGRESSION TEST");
  console.log("==================================================");

  // 1. Authenticate as Priya Sharma
  const loginRes = await req({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'priya@primeroute.com', password: 'Manager@2026!' });

  if (loginRes.status !== 200 || !loginRes.body?.token) {
    console.error("FAIL: Login failed", loginRes);
    process.exit(1);
  }
  const token = loginRes.body.token;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  console.log("✓ Authenticated as Priya Sharma (WAREHOUSE_MANAGER)");

  // 2. Check Warehouse Identity Consistency
  console.log("\n--- Checking Warehouse Identity Across Endpoints ---");
  const [dashRes, whRes, trackRes, profRes] = await Promise.all([
    req({ hostname: 'localhost', port: 8080, path: '/api/warehouse-manager/dashboard', headers }),
    req({ hostname: 'localhost', port: 8080, path: '/api/warehouse-manager/warehouse', headers }),
    req({ hostname: 'localhost', port: 8080, path: '/api/warehouse-manager/tracking/live', headers }),
    req({ hostname: 'localhost', port: 8080, path: '/api/warehouse-manager/profile', headers })
  ]);

  const dashCode = dashRes.body?.data?.warehouseCode;
  const whCode = whRes.body?.data?.code;
  const trackCode = trackRes.body?.data?.warehouse?.code;
  const profCode = profRes.body?.data?.warehouseCode;

  console.log(`  Dashboard warehouse code:   ${dashCode}`);
  console.log(`  Warehouse details code:     ${whCode}`);
  console.log(`  Live Tracking hub code:     ${trackCode}`);
  console.log(`  Manager Profile hub code:   ${profCode}`);

  if (dashCode === whCode && whCode === trackCode && trackCode === profCode && whCode === 'WH-BLR-001') {
    console.log("✓ 100% Consistent Warehouse Identity: WH-BLR-001 across all endpoints!");
  } else {
    console.error("FAIL: Inconsistent warehouse identity found!");
    process.exit(1);
  }

  // 3. Check Live Map Tracking Data
  console.log("\n--- Checking Live Map Telemetry ---");
  const activeShipments = trackRes.body?.data?.activeShipments || [];
  console.log(`✓ Active tracked shipments returned: ${activeShipments.length}`);
  activeShipments.forEach((s, idx) => {
    console.log(`  [${idx + 1}] ${s.trackingNumber} | Status: ${s.status} | Lat: ${s.latitude}, Lng: ${s.longitude} | Driver: ${s.driverName} | Vehicle: ${s.vehicleNumber}`);
  });

  // 4. Test Warehouse Details PUT and Persistence
  console.log("\n--- Testing Warehouse Details Update & Persistence ---");
  const testPhone = "+91 80 2555 9999";
  const testEmail = "support.blr@primeroute.com";
  const testHours = "24/7 Operations (3 Automated Shifts)";
  const testMgrPhone = "+91 98001 11001";

  const updateRes = await req({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/warehouse',
    method: 'PUT',
    headers
  }, {
    contactPhone: testPhone,
    contactEmail: testEmail,
    operatingHours: testHours,
    managerPhone: testMgrPhone
  });

  console.log(`  Update HTTP Status: ${updateRes.status}`);

  // Re-fetch to confirm persistence in PostgreSQL
  const refetchWh = await req({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/warehouse',
    headers
  });

  const savedData = refetchWh.body?.data;
  console.log(`  Persisted Phone:     ${savedData?.contactPhone}`);
  console.log(`  Persisted Email:     ${savedData?.contactEmail}`);
  console.log(`  Persisted Hours:     ${savedData?.operatingHours}`);
  console.log(`  Persisted Mgr Phone: ${savedData?.managerPhone}`);

  if (savedData?.contactPhone === testPhone && 
      savedData?.contactEmail === testEmail && 
      savedData?.operatingHours === testHours && 
      savedData?.managerPhone === testMgrPhone) {
    console.log("✓ Warehouse Parameters updated and verified in PostgreSQL!");
  } else {
    console.error("FAIL: Persisted parameters do not match update payload!");
    process.exit(1);
  }

  console.log("\n==================================================");
  console.log("ALL PHASE 4C REGRESSION TESTS PASSED CLEANLY!");
  console.log("==================================================");
}

run().catch(console.error);
