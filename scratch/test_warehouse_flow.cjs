const axios = require('axios');
const { execSync } = require('child_process');

const BASE_URL = 'http://localhost:8080/api';
const psqlPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe';

async function login(email, password = 'Manager@2026!') {
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
    return res.data.token || res.data.data?.token || res.data.jwt;
  } catch (err) {
    console.error(`Login failed for ${email}:`, err.response?.data || err.message);
    throw err;
  }
}

async function runTests() {
  console.log('=== STEP 1: VERIFY EXISTING ORDER 737 (PR-ORD-96307644) ===');
  
  const blrEmail = 'priya@primeroute.com';
  const ccuEmail = 'ccu.east@primeroute.com';

  console.log(`BLR Manager: ${blrEmail}`);
  console.log(`CCU Manager: ${ccuEmail}`);

  const blrToken = await login(blrEmail, 'Manager@2026!');
  const ccuToken = await login(ccuEmail, 'Manager@2026!');

  // 1. Check Bengaluru My Orders
  const blrOrdersRes = await axios.get(`${BASE_URL}/warehouse-manager/orders`, {
    headers: { Authorization: `Bearer ${blrToken}` }
  });
  const blrOrders = blrOrdersRes.data.data;
  console.log(`Total orders in Bengaluru WH-BLR-001: ${blrOrders.length}`);
  const foundInBlr = blrOrders.find(o => o.orderNumber === 'PR-ORD-96307644' || o.id === 737);
  console.log('PR-ORD-96307644 found in Bengaluru:', !!foundInBlr);
  if (foundInBlr) {
    console.log('Order 737 details in BLR portal:', {
      id: foundInBlr.id,
      orderNumber: foundInBlr.orderNumber,
      originWarehouseCode: foundInBlr.originWarehouseCode,
      originWarehouseName: foundInBlr.originWarehouseName,
      pickupAddress: foundInBlr.pickupAddress,
      pickupCity: foundInBlr.pickupCity,
      deliveryAddress: foundInBlr.deliveryAddress,
      deliveryCity: foundInBlr.deliveryCity,
      status: foundInBlr.status,
      trackingNumber: foundInBlr.trackingNumber
    });
  }

  // 2. Check Kolkata My Orders (must NOT be present)
  const ccuOrdersRes = await axios.get(`${BASE_URL}/warehouse-manager/orders`, {
    headers: { Authorization: `Bearer ${ccuToken}` }
  });
  const ccuOrders = ccuOrdersRes.data.data;
  console.log(`Total orders in Kolkata WH-CCU-006: ${ccuOrders.length}`);
  const foundInCcu = ccuOrders.find(o => o.orderNumber === 'PR-ORD-96307644' || o.id === 737);
  console.log('PR-ORD-96307644 found in Kolkata (MUST BE FALSE):', !!foundInCcu);

  if (!foundInBlr || foundInCcu) {
    throw new Error('FAILED: Order 737 visibility assertion!');
  }

  console.log('\n=== STEP 2: CREATE NEW ORDER (BLR -> CCU SAME_DAY) & VERIFY IMMEDIATE VISIBILITY ===');
  const custEmail = 'customer@primeroute.com';
  console.log('Customer Email:', custEmail);
  const custToken = await login(custEmail, 'Customer@2026!');

  // Get addresses for customer
  const addrsRes = await axios.get(`${BASE_URL}/customer/addresses`, {
    headers: { Authorization: `Bearer ${custToken}` }
  });
  const addrs = addrsRes.data.data;
  console.log(`Customer addresses count: ${addrs.length}`);
  
  let blrAddr = addrs.find(a => (a.city && (a.city.toLowerCase().includes('bang') || a.city.toLowerCase().includes('beng'))) || (a.postalCode && a.postalCode.startsWith('560')));
  let ccuAddr = addrs.find(a => (a.city && (a.city.toLowerCase().includes('kolk') || a.city.toLowerCase().includes('calc'))) || (a.postalCode && a.postalCode.startsWith('700')));

  if (!blrAddr) {
    console.log('Creating Bengaluru address for customer...');
    const createBlr = await axios.post(`${BASE_URL}/customer/addresses`, {
      contactName: 'Customer BLR',
      phone: '9876543210',
      addressLine1: 'Maa bhubaneswari ladies pg',
      addressLine2: 'Marathahalli, Bangalore',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560037',
      country: 'India',
      addressType: 'HOME'
    }, { headers: { Authorization: `Bearer ${custToken}` } });
    blrAddr = createBlr.data.data;
  }

  if (!ccuAddr) {
    console.log('Creating Kolkata address for customer...');
    const createCcu = await axios.post(`${BASE_URL}/customer/addresses`, {
      contactName: 'Recipient Kolkata',
      phone: '9876543211',
      addressLine1: '11, Netaji Subhas Road',
      addressLine2: 'Hare Street',
      city: 'Kolkata',
      state: 'West Bengal',
      postalCode: '700001',
      country: 'India',
      addressType: 'OFFICE'
    }, { headers: { Authorization: `Bearer ${custToken}` } });
    ccuAddr = createCcu.data.data;
  }

  // Create Order: Bengaluru -> Kolkata (SAME_DAY)
  console.log('Placing BLR -> CCU SAME_DAY order...');
  const newOrderRes = await axios.post(`${BASE_URL}/customer/orders`, {
    pickupAddressId: blrAddr.id,
    deliveryAddressId: ccuAddr.id,
    packageDescription: 'Critical Electronics Parcel',
    packageWeight: 2.5,
    packageQuantity: 1,
    deliveryType: 'SAME_DAY',
    paymentMethod: 'COD'
  }, { headers: { Authorization: `Bearer ${custToken}` } });

  const createdOrder = newOrderRes.data.data;
  console.log('Created Order Number:', createdOrder.orderNumber);
  console.log('Allocated Origin Warehouse:', createdOrder.originWarehouseCode, createdOrder.originWarehouseName);
  console.log('Shipment Tracking Number:', createdOrder.trackingNumber);

  if (createdOrder.originWarehouseCode !== 'WH-BLR-001') {
    throw new Error(`FAILED: Expected origin warehouse WH-BLR-001, got ${createdOrder.originWarehouseCode}`);
  }

  // Verify in Bengaluru My Orders
  const blrOrdersUpdated = (await axios.get(`${BASE_URL}/warehouse-manager/orders`, {
    headers: { Authorization: `Bearer ${blrToken}` }
  })).data.data;
  const newInBlr = blrOrdersUpdated.find(o => o.orderNumber === createdOrder.orderNumber);
  console.log(`New Order ${createdOrder.orderNumber} VISIBLE in Bengaluru:`, !!newInBlr);

  // Verify NOT in Kolkata My Orders
  const ccuOrdersUpdated = (await axios.get(`${BASE_URL}/warehouse-manager/orders`, {
    headers: { Authorization: `Bearer ${ccuToken}` }
  })).data.data;
  const newInCcu = ccuOrdersUpdated.find(o => o.orderNumber === createdOrder.orderNumber);
  console.log(`New Order ${createdOrder.orderNumber} NOT in Kolkata:`, !newInCcu);

  if (!newInBlr || newInCcu) {
    throw new Error('FAILED: New BLR order isolation assertion!');
  }

  console.log('\n=== STEP 3: CREATE NEW ORDER (CCU -> BLR SAME_DAY) & VERIFY IMMEDIATE VISIBILITY ===');
  // Create Order: Kolkata -> Bengaluru (SAME_DAY)
  console.log('Placing CCU -> BLR SAME_DAY order...');
  const revOrderRes = await axios.post(`${BASE_URL}/customer/orders`, {
    pickupAddressId: ccuAddr.id,
    deliveryAddressId: blrAddr.id,
    packageDescription: 'Textile Sample Consignment',
    packageWeight: 3.0,
    packageQuantity: 1,
    deliveryType: 'SAME_DAY',
    paymentMethod: 'UPI'
  }, { headers: { Authorization: `Bearer ${custToken}` } });

  const revOrder = revOrderRes.data.data;
  console.log('Created Reverse Order Number:', revOrder.orderNumber);
  console.log('Allocated Origin Warehouse:', revOrder.originWarehouseCode, revOrder.originWarehouseName);
  console.log('Shipment Tracking Number:', revOrder.trackingNumber);

  if (revOrder.originWarehouseCode !== 'WH-CCU-006') {
    throw new Error(`FAILED: Expected origin warehouse WH-CCU-006, got ${revOrder.originWarehouseCode}`);
  }

  // Verify in Kolkata My Orders
  const ccuOrdersRev = (await axios.get(`${BASE_URL}/warehouse-manager/orders`, {
    headers: { Authorization: `Bearer ${ccuToken}` }
  })).data.data;
  const revInCcu = ccuOrdersRev.find(o => o.orderNumber === revOrder.orderNumber);
  console.log(`Reverse Order ${revOrder.orderNumber} VISIBLE in Kolkata:`, !!revInCcu);

  // Verify NOT in Bengaluru My Orders
  const blrOrdersRev = (await axios.get(`${BASE_URL}/warehouse-manager/orders`, {
    headers: { Authorization: `Bearer ${blrToken}` }
  })).data.data;
  const revInBlr = blrOrdersRev.find(o => o.orderNumber === revOrder.orderNumber);
  console.log(`Reverse Order ${revOrder.orderNumber} NOT in Bengaluru:`, !revInBlr);

  if (!revInCcu || revInBlr) {
    throw new Error('FAILED: Reverse CCU order isolation assertion!');
  }

  console.log('\n======================================================');
  console.log('>>> ALL REAL-TIME ORDER & WAREHOUSE ROUTING TESTS PASSED! <<<');
  console.log('======================================================');
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
