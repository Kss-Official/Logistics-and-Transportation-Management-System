const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/primeroute_db'
});

async function inspect() {
  await client.connect();

  console.log('================== USERS ==================');
  const users = await client.query('SELECT id, email, role, full_name, username, phone_number, is_active FROM users ORDER BY id');
  console.table(users.rows);

  console.log('================== CUSTOMERS ==================');
  const customers = await client.query('SELECT id, user_id, customer_name, email, phone, company_name FROM customers ORDER BY id');
  console.table(customers.rows);

  console.log('================== MASTER TABLE COUNTS ==================');
  const tables = [
    'users', 'customers', 'addresses', 'orders', 'order_items', 
    'shipments', 'shipment_tracking_events', 'fulfillment_allocations', 
    'invoices', 'inventory_transactions', 'drivers', 'vehicles', 'warehouses'
  ];
  for (const t of tables) {
    try {
      const res = await client.query(`SELECT count(*) FROM ${t}`);
      console.log(`${t}: ${res.rows[0].count}`);
    } catch (e) {
      console.log(`${t}: table does not exist or error: ${e.message}`);
    }
  }

  console.log('================== DETAILED CUSTOMER BREAKDOWN ==================');
  // For every customer, get counts of related entities
  for (const c of customers.rows) {
    const ordersRes = await client.query('SELECT count(*) as count, array_agg(id) as ids FROM orders WHERE customer_id = $1', [c.id]);
    const orderIds = ordersRes.rows[0].ids || [];
    
    let orderItemCount = 0;
    let shipmentCount = 0;
    let shipmentIds = [];
    let trackingEventCount = 0;
    let fulfillmentAllocCount = 0;
    let invoiceCount = 0;
    let inventoryTxCount = 0;

    if (orderIds.length > 0) {
      const oiRes = await client.query('SELECT count(*) FROM order_items WHERE order_id = ANY($1::bigint[])', [orderIds]);
      orderItemCount = parseInt(oiRes.rows[0].count, 10);

      const sRes = await client.query('SELECT count(*), array_agg(id) as ids FROM shipments WHERE order_id = ANY($1::bigint[])', [orderIds]);
      shipmentCount = parseInt(sRes.rows[0].count, 10);
      shipmentIds = sRes.rows[0].ids || [];

      if (shipmentIds.length > 0) {
        const steRes = await client.query('SELECT count(*) FROM shipment_tracking_events WHERE shipment_id = ANY($1::bigint[])', [shipmentIds]);
        trackingEventCount = parseInt(steRes.rows[0].count, 10);
      }

      const faRes = await client.query('SELECT count(*) FROM fulfillment_allocations WHERE order_id = ANY($1::bigint[])', [orderIds]);
      fulfillmentAllocCount = parseInt(faRes.rows[0].count, 10);

      const invRes = await client.query('SELECT count(*) FROM invoices WHERE order_id = ANY($1::bigint[])', [orderIds]);
      invoiceCount = parseInt(invRes.rows[0].count, 10);

      const itxRes = await client.query('SELECT count(*) FROM inventory_transactions WHERE reference_order_id = ANY($1::bigint[])', [orderIds]);
      inventoryTxCount = parseInt(itxRes.rows[0].count, 10);
    }

    // Customer addresses
    const addrRes = await client.query('SELECT count(*) FROM addresses WHERE customer_id = $1', [c.id]);
    const addrCount = parseInt(addrRes.rows[0].count, 10);

    console.log(`\n--- Customer ID: ${c.id} | User ID: ${c.user_id} ---`);
    console.log(`Name: ${c.customer_name}`);
    console.log(`Email: ${c.email}`);
    console.log(`Company: ${c.company_name}`);
    console.log(`Addresses: ${addrCount}`);
    console.log(`Orders: ${ordersRes.rows[0].count} (IDs: ${JSON.stringify(orderIds)})`);
    console.log(`Order Items: ${orderItemCount}`);
    console.log(`Shipments: ${shipmentCount} (IDs: ${JSON.stringify(shipmentIds)})`);
    console.log(`Shipment Tracking Events: ${trackingEventCount}`);
    console.log(`Fulfillment Allocations: ${fulfillmentAllocCount}`);
    console.log(`Invoices: ${invoiceCount}`);
    console.log(`Inventory Transactions: ${inventoryTxCount}`);
  }

  // Also check if any orders have no customer_id
  const noCustOrders = await client.query('SELECT count(*), array_agg(id) as ids FROM orders WHERE customer_id IS NULL');
  console.log('\n--- Orders without customer_id ---');
  console.log(`Count: ${noCustOrders.rows[0].count}, IDs: ${JSON.stringify(noCustOrders.rows[0].ids)}`);

  console.log('\n================== SAMPLE ORDERS ==================');
  const sampleOrders = await client.query(`
    SELECT o.id, o.order_number, o.status, o.customer_id, c.customer_name, c.email as cust_email, o.created_at, o.origin_warehouse_id
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.id
    ORDER BY o.id
  `);
  console.table(sampleOrders.rows);

  console.log('\n================== SAMPLE SHIPMENTS ==================');
  const sampleShipments = await client.query(`
    SELECT s.id, s.tracking_number, s.status, s.order_id, s.driver_id, s.vehicle_id, s.origin_warehouse_id, c.customer_name
    FROM shipments s
    LEFT JOIN orders o ON s.order_id = o.id
    LEFT JOIN customers c ON o.customer_id = c.id
    ORDER BY s.id
  `);
  console.table(sampleShipments.rows);

  await client.end();
}

inspect().catch(err => { console.error(err); process.exit(1); });
