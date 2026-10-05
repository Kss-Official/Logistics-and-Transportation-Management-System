const http = require('http');

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, data: json });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function login(email, password) {
  const res = await request('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email, password });
  return res.data?.token || res.data?.data?.token;
}

async function resetPasswordForUser(email, password) {
  const forgotResp = await request('http://localhost:8080/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email });

  const token = forgotResp.data?.resetUrl ? forgotResp.data.resetUrl.split('token=')[1] : null;
  if (token) {
    await request('http://localhost:8080/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      token,
      newPassword: password,
      confirmPassword: password
    });
  }
}

async function main() {
  console.log('=== RUNNING SHIPMENT DATA CONTRACT TESTS ===\n');

  // Set known passwords
  await resetPasswordForUser('gudisahoo@gmail.com', 'Password@123');
  await resetPasswordForUser('customer@primeroute.com', 'Password@123');

  const tokenCustomerA = await login('gudisahoo@gmail.com', 'Password@123');
  const tokenCustomerB = await login('customer@primeroute.com', 'Password@123');

  console.log('Customer A logged in:', !!tokenCustomerA);
  console.log('Customer B logged in:', !!tokenCustomerB);

  const headersA = { 'Authorization': `Bearer ${tokenCustomerA}` };
  const headersB = { 'Authorization': `Bearer ${tokenCustomerB}` };

  // 1. Customer A requests own shipment PR-TRK-WQ73ENPZ (ID 628)
  const resA = await request('http://localhost:8080/api/customer/shipments/628', { headers: headersA });
  console.log('\n[TEST 1] Customer A -> own shipment 628 status (Expected 200):', resA.status);
  console.log('  Driver:', resA.data?.data?.driverName);
  console.log('  Vehicle:', resA.data?.data?.vehicleNumber);
  console.log('  Warehouse:', resA.data?.data?.originWarehouseName);
  console.log('  Pickup Address:', resA.data?.data?.pickupAddress);
  console.log('  Delivery Address:', resA.data?.data?.deliveryAddress);
  console.log('  Assignment Status:', resA.data?.data?.assignmentStatus);
  console.log('  Events Count:', resA.data?.data?.events?.length);

  // 2. Customer B requests Customer A's shipment 628 (Cross-Customer Security Check)
  const resCross = await request('http://localhost:8080/api/customer/shipments/628', { headers: headersB });
  console.log('\n[TEST 2] Customer B -> Customer A shipment 628 status (Expected 403 Forbidden):', resCross.status);

  // 3. Unauthenticated request to shipment 628
  const resUnauth = await request('http://localhost:8080/api/customer/shipments/628');
  console.log('\n[TEST 3] Unauthenticated -> shipment 628 status (Expected 401/403):', resUnauth.status);

  // 4. Invalid shipment ID
  const resNotFound = await request('http://localhost:8080/api/customer/shipments/999999', { headers: headersA });
  console.log('\n[TEST 4] Invalid shipment 999999 status (Expected 404 Not Found):', resNotFound.status);

  // 5. Test another shipment for Customer A or B
  const listA = await request('http://localhost:8080/api/customer/shipments', { headers: headersA });
  console.log('\n[TEST 5] Customer A shipments list count:', listA.data?.data?.length);
  if (listA.data?.data?.length > 1) {
    const secondShipmentId = listA.data.data[1].id;
    const resSecond = await request(`http://localhost:8080/api/customer/shipments/${secondShipmentId}`, { headers: headersA });
    console.log(`  Second shipment ${secondShipmentId} (${listA.data.data[1].trackingNumber}) status:`, resSecond.status);
    console.log('  Second shipment status:', resSecond.data?.data?.status);
    console.log('  Second shipment origin warehouse:', resSecond.data?.data?.originWarehouseName);
    console.log('  Second shipment pickup address:', resSecond.data?.data?.pickupAddress);
    console.log('  Second shipment delivery address:', resSecond.data?.data?.deliveryAddress);
  }

  const listB = await request('http://localhost:8080/api/customer/shipments', { headers: headersB });
  console.log('\n[TEST 6] Customer B shipments list count:', listB.data?.data?.length);
  if (listB.data?.data?.length > 0) {
    const bShipmentId = listB.data.data[0].id;
    const resBShipment = await request(`http://localhost:8080/api/customer/shipments/${bShipmentId}`, { headers: headersB });
    console.log(`  Customer B shipment ${bShipmentId} (${listB.data.data[0].trackingNumber}) status:`, resBShipment.status);
    console.log('  Customer B shipment status:', resBShipment.data?.data?.status);
    console.log('  Customer B shipment warehouse:', resBShipment.data?.data?.originWarehouseName);
  }

  console.log('\n=== ALL SCENARIO TESTS COMPLETE ===');
}

main().catch(console.error);
