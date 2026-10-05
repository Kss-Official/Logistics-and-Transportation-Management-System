const crypto = require('crypto');
const { execSync } = require('child_process');

process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

const secret = 'PrimeRouteLogisticsSecretKey2026ForDevelopmentOnlyChangeThisLater';

function base64url(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function makeToken(email, role) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64url(JSON.stringify({
    sub: email,
    role: role,
    iat: now,
    exp: now + 3600
  }));

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${header}.${payload}.${signature}`;
}

async function main() {
  console.log('====================================================');
  console.log('1. ACTIVE PRODUCTS IN POSTGRESQL');
  console.log('====================================================');
  const prods = execSync(`${PSQL} -c "SELECT id, sku, name, category, unit_weight, unit_price, active FROM products ORDER BY id;"`, { encoding: 'utf8', env: process.env });
  console.log(prods);

  console.log('====================================================');
  console.log('2. GET PRODUCTS VIA API: GET /api/products');
  console.log('====================================================');
  const prodRes = await fetch('http://localhost:8080/api/products');
  const prodData = await prodRes.json();
  console.log(`Product API Returned: ${prodData.data?.length} products`);
  prodData.data?.forEach(p => {
    console.log(`  - [ID ${p.id}] ${p.sku}: ${p.name} (${p.category}) | ${p.unitWeight} kg | Rs.${p.unitPrice}`);
  });

  console.log('\n====================================================');
  console.log('3. CUSTOMER LIVE QUOTE (3 Products, 5 units)');
  console.log('====================================================');
  const custToken = makeToken('customer@primeroute.com', 'ROLE_CUSTOMER');

  // Fetch saved addresses
  const addrRes = await fetch('http://localhost:8080/api/customer/addresses', {
    headers: { Authorization: `Bearer ${custToken}` }
  });
  const addrData = await addrRes.json();
  console.log('Customer Addresses:', addrData.data?.map(a => `[ID ${a.id}] ${a.contactName} (${a.city})`));

  const pId = addrData.data[0].id;
  const dId = addrData.data[1].id;

  // Selected:
  // Product 1: Dell Laptop (2.1 kg) x 2 = 4.2 kg
  // Product 2: UltraSharp Monitor (5.4 kg) x 1 = 5.4 kg
  // Product 3: Pro Mechanical Keyboard (0.9 kg) x 2 = 1.8 kg
  // Total Quantity = 5 units
  // Total Weight = 4.2 + 5.4 + 1.8 = 11.4 kg
  const quotePayload = {
    pickupAddressId: pId,
    deliveryAddressId: dId,
    packageWeight: 11.4,
    packageQuantity: 5,
    deliveryType: 'STANDARD'
  };

  const qRes = await fetch('http://localhost:8080/api/customer/orders/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${custToken}` },
    body: JSON.stringify(quotePayload)
  });
  const qData = await qRes.json();
  console.log('Quote API Response:', qData.data);

  console.log('\n====================================================');
  console.log('4. SUBMIT MULTI-ITEM ORDER');
  console.log('====================================================');
  const orderPayload = {
    pickupAddressId: pId,
    deliveryAddressId: dId,
    items: [
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 1 },
      { productId: 3, quantity: 2 }
    ],
    packageDescription: '2x Dell Latitude 5430 Laptop, 1x UltraSharp 27-inch 4K Monitor, 2x Pro Wireless Mechanical Keyboard',
    packageWeight: 11.4,
    packageQuantity: 5,
    deliveryType: 'STANDARD'
  };

  const ordRes = await fetch('http://localhost:8080/api/customer/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${custToken}` },
    body: JSON.stringify(orderPayload)
  });
  const ordData = await ordRes.json();
  console.log('Order Placement Status:', ordRes.status);
  console.log('Created Order:', {
    id: ordData.data?.id,
    orderNumber: ordData.data?.orderNumber,
    originWarehouseId: ordData.data?.originWarehouseId,
    originWarehouseName: ordData.data?.originWarehouseName,
    originWarehouseCode: ordData.data?.originWarehouseCode,
    totalAmount: ordData.data?.totalAmount,
    itemsCount: ordData.data?.items?.length
  });

  const createdOrderNum = ordData.data?.orderNumber;
  const createdOrderId = ordData.data?.id;

  console.log('\n====================================================');
  console.log('5. VERIFY POSTGRESQL: ORDERS & ORDER_ITEMS');
  console.log('====================================================');
  console.log(execSync(`${PSQL} -c "SELECT id, order_number, status, origin_warehouse_id, package_quantity, package_weight, total_amount FROM orders WHERE id = ${createdOrderId};"`, { encoding: 'utf8', env: process.env }));
  console.log(execSync(`${PSQL} -c "SELECT oi.id, oi.order_id, p.name AS product, oi.quantity, oi.unit_weight, oi.total_weight, oi.unit_price FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ${createdOrderId};"`, { encoding: 'utf8', env: process.env }));

  console.log('====================================================');
  console.log('6. VERIFY INVENTORY RESERVATION & TRANSACTIONS');
  console.log('====================================================');
  console.log(execSync(`${PSQL} -c "SELECT product_id, warehouse_id, available_stock, reserved_stock, total_stock FROM inventories WHERE product_id IN (1, 2, 3) ORDER BY product_id;"`, { encoding: 'utf8', env: process.env }));
  console.log(execSync(`${PSQL} -c "SELECT id, product_name, sku, transaction_type, quantity, previous_available, new_available, reference_order, reason FROM inventory_transactions WHERE reference_order = '${createdOrderNum}' ORDER BY id;"`, { encoding: 'utf8', env: process.env }));

  console.log('====================================================');
  console.log('7. VERIFY SHIPMENT CREATION');
  console.log('====================================================');
  console.log(execSync(`${PSQL} -c "SELECT id, tracking_number, order_id, origin_warehouse_id, status FROM shipments WHERE order_id = ${createdOrderId};"`, { encoding: 'utf8', env: process.env }));

  console.log('====================================================');
  console.log('8. WAREHOUSE MANAGER: OUTGOING SHIPMENTS PICK LIST');
  console.log('====================================================');
  const whToken = makeToken('priya@primeroute.com', 'ROLE_WAREHOUSE_MANAGER');
  const whRes = await fetch('http://localhost:8080/api/warehouse-manager/shipments/outgoing', {
    headers: { Authorization: `Bearer ${whToken}` }
  });
  const whData = await whRes.json();
  const whTarget = whData.data?.find(s => s.orderNumber === createdOrderNum);
  console.log('Warehouse Outgoing Shipment Found:', {
    trackingNumber: whTarget?.trackingNumber,
    orderNumber: whTarget?.orderNumber,
    originWarehouse: whTarget?.originWarehouseName,
    status: whTarget?.status,
    itemsInPickList: whTarget?.items?.length
  });
  if (whTarget?.items) {
    console.log('Pick List Manifest:');
    whTarget.items.forEach(it => {
      console.log(`  - SKU: ${it.sku} | ${it.productName} | Pick Quantity: ${it.quantity} | Total Weight: ${it.totalWeight} kg`);
    });
  }
}

main().catch(console.error);
