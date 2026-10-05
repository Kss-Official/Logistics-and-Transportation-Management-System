const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';

async function login(email, password) {
  const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
  return res.data.data ? res.data.data.token : res.data.token;
}

async function tryLogin(email, passwords) {
  for (const pwd of passwords) {
    try {
      const token = await login(email, pwd);
      return { token, email, pwd };
    } catch (e) {}
  }
  return null;
}

async function main() {
  console.log('=== 1. AUTHENTICATION & MANAGER SCOPING TEST ===');

  const ccuToken = await login('ccu.east@primeroute.com', 'Manager@2026!');
  console.log('✓ Kolkata Manager logged in successfully.');

  const blrToken = await login('priya@primeroute.com', 'Manager@2026!');
  console.log('✓ Bengaluru Manager logged in successfully.');

  let custLogin = await tryLogin('customer@primeroute.com', ['Customer@2026!', 'Password@123', 'Password@2026!']);
  if (!custLogin) {
    custLogin = await tryLogin('shrutisanjanasahoo@gmail.com', ['Customer@2026!', 'Password@123', 'Shruti@2026!', 'Password123!']);
  }
  if (!custLogin) {
    custLogin = await tryLogin('demo_customer@primeroute.com', ['Customer@2026!', 'Password@123']);
  }

  if (!custLogin) {
    console.log('Registering a fresh test customer...');
    const regEmail = `test.cust.${Date.now()}@primeroute.com`;
    await axios.post(`${BASE_URL}/auth/register`, {
      email: regEmail,
      password: 'Password@2026!',
      fullName: 'Verification Customer',
      phone: '9876543210',
      role: 'CUSTOMER'
    });
    custLogin = { token: await login(regEmail, 'Password@2026!'), email: regEmail };
  }
  const customerToken = custLogin.token;
  console.log(`✓ Customer (${custLogin.email}) logged in successfully.`);

  // Test Kolkata Manager My Orders
  console.log('\n=== 2. VERIFY EXISTING REMEDIATED ORDER PR-ORD-76406402 ===');
  const ccuOrdersRes = await axios.get(`${BASE_URL}/warehouse-manager/orders`, {
    headers: { Authorization: `Bearer ${ccuToken}` }
  });
  const ccuOrders = ccuOrdersRes.data.data || ccuOrdersRes.data;
  console.log(`Kolkata Manager sees ${ccuOrders.length} orders.`);
  const foundInCcu = ccuOrders.find(o => o.orderNumber === 'PR-ORD-76406402');
  if (foundInCcu) {
    console.log(`✓ PR-ORD-76406402 FOUND in Kolkata Manager My Orders!`);
    console.log(`  Origin Warehouse: ${foundInCcu.originWarehouseCode} (${foundInCcu.originWarehouseName})`);
    console.log(`  Operational Stage: ${foundInCcu.operationalStage}`);
  } else {
    console.error(`✗ PR-ORD-76406402 NOT found in Kolkata Manager My Orders!`);
  }

  // Test Bengaluru Manager My Orders
  const blrOrdersRes = await axios.get(`${BASE_URL}/warehouse-manager/orders`, {
    headers: { Authorization: `Bearer ${blrToken}` }
  });
  const blrOrders = blrOrdersRes.data.data || blrOrdersRes.data;
  console.log(`Bengaluru Manager sees ${blrOrders.length} orders.`);
  const foundInBlr = blrOrders.find(o => o.orderNumber === 'PR-ORD-76406402');
  if (!foundInBlr) {
    console.log(`✓ PR-ORD-76406402 IS NOT in Bengaluru Manager My Orders (Properly Excluded)!`);
  } else {
    console.error(`✗ PR-ORD-76406402 incorrectly visible in Bengaluru Manager My Orders!`);
  }

  // Security test: Bengaluru manager accessing Kolkata order by ID
  try {
    await axios.get(`${BASE_URL}/warehouse-manager/orders/55`, {
      headers: { Authorization: `Bearer ${blrToken}` }
    });
    console.error(`✗ Security breach: Bengaluru manager accessed Kolkata order 55!`);
  } catch (err) {
    console.log(`✓ Security verified: Bengaluru manager denied access to Kolkata order (HTTP ${err.response ? err.response.status : err.message})`);
  }

  console.log('\n=== 3. LIVE ORDER CREATION FLOW TESTS ===');

  // Create Kolkata pickup address
  const createKolkata = await axios.post(`${BASE_URL}/customer/addresses`, {
    contactName: 'Sanjana Sahoo',
    phone: '9876543210',
    addressLine1: '11, Netaji Subhas Road',
    addressLine2: 'Hare Street',
    city: 'Kolkata',
    state: 'West Bengal',
    postalCode: '700001',
    country: 'India',
    addressType: 'PICKUP',
    defaultAddress: false
  }, { headers: { Authorization: `Bearer ${customerToken}` } });
  const kolkataAddr = createKolkata.data.data || createKolkata.data;

  // Create Bangalore delivery address
  const createBlr = await axios.post(`${BASE_URL}/customer/addresses`, {
    contactName: 'Sanjana Sahoo',
    phone: '9876543210',
    addressLine1: 'Maa bhubaneswari ladies pg',
    addressLine2: 'Marathahalli',
    city: 'Bangalore',
    state: 'Karnataka',
    postalCode: '560037',
    country: 'India',
    addressType: 'DELIVERY',
    defaultAddress: false
  }, { headers: { Authorization: `Bearer ${customerToken}` } });
  const blrAddr = createBlr.data.data || createBlr.data;

  // Create Chennai delivery address
  const createChn = await axios.post(`${BASE_URL}/customer/addresses`, {
    contactName: 'Sanjana Sahoo',
    phone: '9876543210',
    addressLine1: 'Anna Salai, Guindy',
    addressLine2: 'Sector 4',
    city: 'Chennai',
    state: 'Tamil Nadu',
    postalCode: '600032',
    country: 'India',
    addressType: 'DELIVERY',
    defaultAddress: false
  }, { headers: { Authorization: `Bearer ${customerToken}` } });
  const chennaiAddr = createChn.data.data || createChn.data;

  // Create Delhi delivery address
  const createDel = await axios.post(`${BASE_URL}/customer/addresses`, {
    contactName: 'Sanjana Sahoo',
    phone: '9876543210',
    addressLine1: 'Connaught Place',
    addressLine2: 'Block B',
    city: 'Delhi',
    state: 'Delhi',
    postalCode: '110001',
    country: 'India',
    addressType: 'DELIVERY',
    defaultAddress: false
  }, { headers: { Authorization: `Bearer ${customerToken}` } });
  const delhiAddr = createDel.data.data || createDel.data;

  // Create Cuttack pickup address (No warehouse)
  const createCtc = await axios.post(`${BASE_URL}/customer/addresses`, {
    contactName: 'Sanjana Sahoo',
    phone: '9876543210',
    addressLine1: 'Badambadi Bus Stand Road',
    addressLine2: 'Madhupatna',
    city: 'Cuttack',
    state: 'Odisha',
    postalCode: '753001',
    country: 'India',
    addressType: 'PICKUP',
    defaultAddress: false
  }, { headers: { Authorization: `Bearer ${customerToken}` } });
  const cuttackAddr = createCtc.data.data || createCtc.data;

  // Fetch catalog product
  const prodRes = await axios.get(`${BASE_URL}/products`, {
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  const products = prodRes.data.data || prodRes.data;
  const prod = products[0];
  console.log(`Using product: ${prod.sku} (${prod.name})`);

  // TEST A: Pickup Kolkata -> Delivery Bangalore
  console.log('\n--- TEST A: Pickup Kolkata -> Delivery Bangalore ---');
  const orderARes = await axios.post(`${BASE_URL}/customer/orders`, {
    pickupAddressId: kolkataAddr.id,
    deliveryAddressId: blrAddr.id,
    packageDescription: 'Electronic Goods - Kolkata to Bangalore',
    packageWeight: 2.5,
    packageQuantity: 1,
    deliveryType: 'STANDARD',
    items: [{ productId: prod.id, quantity: 1 }]
  }, { headers: { Authorization: `Bearer ${customerToken}` } });
  const orderA = orderARes.data.data || orderARes.data;
  console.log(`Created Order A: ${orderA.orderNumber}`);
  console.log(`  Origin Warehouse: ${orderA.originWarehouseCode} (${orderA.originWarehouseName})`);
  console.log(`  Tracking: ${orderA.trackingNumber}`);

  // TEST B: Pickup Bangalore -> Delivery Kolkata
  console.log('\n--- TEST B: Pickup Bangalore -> Delivery Kolkata ---');
  const orderBRes = await axios.post(`${BASE_URL}/customer/orders`, {
    pickupAddressId: blrAddr.id,
    deliveryAddressId: kolkataAddr.id,
    packageDescription: 'Electronic Goods - Bangalore to Kolkata',
    packageWeight: 2.5,
    packageQuantity: 1,
    deliveryType: 'STANDARD',
    items: [{ productId: prod.id, quantity: 1 }]
  }, { headers: { Authorization: `Bearer ${customerToken}` } });
  const orderB = orderBRes.data.data || orderBRes.data;
  console.log(`Created Order B: ${orderB.orderNumber}`);
  console.log(`  Origin Warehouse: ${orderB.originWarehouseCode} (${orderB.originWarehouseName})`);
  console.log(`  Tracking: ${orderB.trackingNumber}`);

  // TEST C: Pickup Cuttack -> Delivery Bangalore (No local warehouse)
  console.log('\n--- TEST C: Pickup Cuttack -> Delivery Bangalore (No local warehouse) ---');
  const orderCRes = await axios.post(`${BASE_URL}/customer/orders`, {
    pickupAddressId: cuttackAddr.id,
    deliveryAddressId: blrAddr.id,
    packageDescription: 'Handicrafts - Cuttack to Bangalore',
    packageWeight: 2.0,
    packageQuantity: 1,
    deliveryType: 'STANDARD',
    items: [{ productId: prod.id, quantity: 1 }]
  }, { headers: { Authorization: `Bearer ${customerToken}` } });
  const orderC = orderCRes.data.data || orderCRes.data;
  console.log(`Created Order C: ${orderC.orderNumber}`);
  console.log(`  Origin Warehouse: ${orderC.originWarehouseCode ? orderC.originWarehouseCode : 'null (EXCEPTION as expected)'}`);
  console.log(`  Tracking Number: ${orderC.trackingNumber ? orderC.trackingNumber : 'NONE (No shipment created - Correct)'}`);

  // TEST D: Destination Invariance (Pickup Kolkata -> Delivery Chennai)
  console.log('\n--- TEST D1: Destination Invariance: Pickup Kolkata -> Delivery Chennai ---');
  const orderD1Res = await axios.post(`${BASE_URL}/customer/orders`, {
    pickupAddressId: kolkataAddr.id,
    deliveryAddressId: chennaiAddr.id,
    packageDescription: 'Textiles - Kolkata to Chennai',
    packageWeight: 3.0,
    packageQuantity: 1,
    deliveryType: 'STANDARD',
    items: [{ productId: prod.id, quantity: 1 }]
  }, { headers: { Authorization: `Bearer ${customerToken}` } });
  const orderD1 = orderD1Res.data.data || orderD1Res.data;
  console.log(`Created Order D1: ${orderD1.orderNumber}`);
  console.log(`  Origin Warehouse: ${orderD1.originWarehouseCode} (${orderD1.originWarehouseName})`);

  // TEST D2: Destination Invariance (Pickup Kolkata -> Delivery Delhi)
  console.log('\n--- TEST D2: Destination Invariance: Pickup Kolkata -> Delivery Delhi ---');
  const orderD2Res = await axios.post(`${BASE_URL}/customer/orders`, {
    pickupAddressId: kolkataAddr.id,
    deliveryAddressId: delhiAddr.id,
    packageDescription: 'Books - Kolkata to Delhi',
    packageWeight: 3.0,
    packageQuantity: 1,
    deliveryType: 'STANDARD',
    items: [{ productId: prod.id, quantity: 1 }]
  }, { headers: { Authorization: `Bearer ${customerToken}` } });
  const orderD2 = orderD2Res.data.data || orderD2Res.data;
  console.log(`Created Order D2: ${orderD2.orderNumber}`);
  console.log(`  Origin Warehouse: ${orderD2.originWarehouseCode} (${orderD2.originWarehouseName})`);

  console.log('\n=== 4. VERIFY WAREHOUSE MANAGER PORTAL VISIBILITY FOR NEW ORDERS ===');
  const ccuOrdersAfterRes = await axios.get(`${BASE_URL}/warehouse-manager/orders`, {
    headers: { Authorization: `Bearer ${ccuToken}` }
  });
  const ccuOrdersAfter = ccuOrdersAfterRes.data.data || ccuOrdersAfterRes.data;
  const aInCcu = ccuOrdersAfter.some(o => o.orderNumber === orderA.orderNumber);
  const bInCcu = ccuOrdersAfter.some(o => o.orderNumber === orderB.orderNumber);
  console.log(`Kolkata Manager sees Order A (Kolkata->BLR): ${aInCcu ? 'YES (Correct)' : 'NO'}`);
  console.log(`Kolkata Manager sees Order B (BLR->Kolkata): ${bInCcu ? 'YES (WRONG)' : 'NO (Correctly Excluded)'}`);

  const blrOrdersAfterRes = await axios.get(`${BASE_URL}/warehouse-manager/orders`, {
    headers: { Authorization: `Bearer ${blrToken}` }
  });
  const blrOrdersAfter = blrOrdersAfterRes.data.data || blrOrdersAfterRes.data;
  const aInBlr = blrOrdersAfter.some(o => o.orderNumber === orderA.orderNumber);
  const bInBlr = blrOrdersAfter.some(o => o.orderNumber === orderB.orderNumber);
  console.log(`Bengaluru Manager sees Order A (Kolkata->BLR): ${aInBlr ? 'YES (WRONG)' : 'NO (Correctly Excluded)'}`);
  console.log(`Bengaluru Manager sees Order B (BLR->Kolkata): ${bInBlr ? 'YES (Correct)' : 'NO'}`);

  console.log('\n=== FINAL SUMMARY ===');
  console.log(`PR-ORD-76406402 Remediation: ${foundInCcu && !foundInBlr ? 'PASS' : 'FAIL'}`);
  console.log(`TEST A (Kolkata -> Bangalore): Origin = ${orderA.originWarehouseCode} -> ${orderA.originWarehouseCode === 'WH-CCU-006' ? 'PASS' : 'FAIL'}`);
  console.log(`TEST B (Bangalore -> Kolkata): Origin = ${orderB.originWarehouseCode} -> ${orderB.originWarehouseCode === 'WH-BLR-001' ? 'PASS' : 'FAIL'}`);
  console.log(`TEST C (Cuttack -> Bangalore): Origin = ${orderC.originWarehouseCode || 'null (EXCEPTION)'} -> ${!orderC.originWarehouseCode ? 'PASS' : 'FAIL'}`);
  console.log(`TEST D1 (Kolkata -> Chennai): Origin = ${orderD1.originWarehouseCode} -> ${orderD1.originWarehouseCode === 'WH-CCU-006' ? 'PASS' : 'FAIL'}`);
  console.log(`TEST D2 (Kolkata -> Delhi): Origin = ${orderD2.originWarehouseCode} -> ${orderD2.originWarehouseCode === 'WH-CCU-006' ? 'PASS' : 'FAIL'}`);
}

main().catch(err => {
  console.error('Error running test script:', err.response ? err.response.data : err.message);
});
