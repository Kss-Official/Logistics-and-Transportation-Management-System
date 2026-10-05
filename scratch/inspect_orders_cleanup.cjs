const { Client } = require('pg');

async function inspect() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres123@localhost:5432/primeroute_db'
  });

  await client.connect();

  const targetOrders = ['PR-ORD-29842877', 'PR-ORD-74855865'];
  console.log('=== STEP 1: INSPECTING TARGET ORDERS ===');
  
  const ordersRes = await client.query(`
    SELECT o.*, u.email as user_email, u.full_name as user_full_name
    FROM orders o
    LEFT JOIN users u ON o.customer_id = u.id
    WHERE o.order_number = ANY($1)
  `, [targetOrders]);

  console.log(`Found ${ordersRes.rows.length} order(s):`);
  console.log(JSON.stringify(ordersRes.rows, null, 2));

  const orderIds = ordersRes.rows.map(r => r.id);

  if (orderIds.length === 0) {
    console.log('No orders found matching numbers:', targetOrders);
    await client.end();
    return;
  }

  console.log('\n=== STEP 2: INSPECTING ORDER ITEMS ===');
  const itemsRes = await client.query(`
    SELECT * FROM order_items WHERE order_id = ANY($1)
  `, [orderIds]);
  console.log(`Found ${itemsRes.rows.length} order items:`, JSON.stringify(itemsRes.rows, null, 2));

  console.log('\n=== STEP 2.1: INSPECTING INVOICES ===');
  const invoicesRes = await client.query(`
    SELECT * FROM invoices WHERE order_id = ANY($1) OR order_number = ANY($2)
  `, [orderIds, targetOrders]);
  console.log(`Found ${invoicesRes.rows.length} invoices:`, JSON.stringify(invoicesRes.rows, null, 2));

  console.log('\n=== STEP 2.2: INSPECTING SHIPMENTS ===');
  const shipmentsRes = await client.query(`
    SELECT * FROM shipments WHERE order_id = ANY($1) OR order_number = ANY($2)
  `, [orderIds, targetOrders]);
  console.log(`Found ${shipmentsRes.rows.length} shipments:`, JSON.stringify(shipmentsRes.rows, null, 2));

  const shipmentIds = shipmentsRes.rows.map(s => s.id);

  if (shipmentIds.length > 0) {
    console.log('\n=== STEP 2.3: INSPECTING SHIPMENT TRACKING EVENTS ===');
    const eventsRes = await client.query(`
      SELECT * FROM shipment_tracking_events WHERE shipment_id = ANY($1)
    `, [shipmentIds]);
    console.log(`Found ${eventsRes.rows.length} tracking events:`, JSON.stringify(eventsRes.rows, null, 2));

    console.log('\n=== STEP 2.4: INSPECTING PROOF OF DELIVERIES ===');
    try {
      const podRes = await client.query(`
        SELECT * FROM proof_of_deliveries WHERE shipment_id = ANY($1)
      `, [shipmentIds]);
      console.log(`Found ${podRes.rows.length} POD records:`, JSON.stringify(podRes.rows, null, 2));
    } catch (e) {
      console.log('proof_of_deliveries table check:', e.message);
    }
  }

  console.log('\n=== STEP 2.5: INSPECTING FULFILLMENT ALLOCATIONS ===');
  try {
    const allocRes = await client.query(`
      SELECT * FROM fulfillment_allocations WHERE order_id = ANY($1)
    `, [orderIds]);
    console.log(`Found ${allocRes.rows.length} fulfillment allocations:`, JSON.stringify(allocRes.rows, null, 2));
  } catch (e) {
    console.log('fulfillment_allocations table check:', e.message);
  }

  console.log('\n=== STEP 2.6: INSPECTING INVENTORY TRANSACTIONS ===');
  try {
    const invTxRes = await client.query(`
      SELECT * FROM inventory_transactions WHERE reference_order_id = ANY($1) OR reference_number = ANY($2)
    `, [orderIds, targetOrders]);
    console.log(`Found ${invTxRes.rows.length} inventory transactions:`, JSON.stringify(invTxRes.rows, null, 2));
  } catch (e) {
    console.log('inventory_transactions table check:', e.message);
  }

  console.log('\n=== STEP 2.7: CHECKING ALL FOREIGN KEYS REFERENCING ORDERS & SHIPMENTS ===');
  const fkRes = await client.query(`
    SELECT
      tc.table_schema, 
      tc.constraint_name, 
      tc.table_name, 
      kcu.column_name, 
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name 
    FROM 
      information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name IN ('orders', 'shipments', 'invoices');
  `);
  console.log('Foreign key relationships to orders, shipments, invoices:');
  console.log(JSON.stringify(fkRes.rows, null, 2));

  await client.end();
}

inspect().catch(err => {
  console.error('Error during inspection:', err);
  process.exit(1);
});
