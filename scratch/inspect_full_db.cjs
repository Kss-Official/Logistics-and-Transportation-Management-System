const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: 'password' in process.env ? process.env.PGPASSWORD : 'postgres123',
  host: 'localhost',
  port: 5432,
  database: 'primeroute_db'
});

async function main() {
  try {
    await client.connect();
    console.log('=== PRIMEROUTE DB FULL INVENTORY SURVEY ===\n');

    // 1. Table Counts
    const tables = [
      'users',
      'customers',
      'addresses',
      'orders',
      'order_items',
      'shipments',
      'shipment_tracking_events',
      'fulfillment_allocations',
      'invoices',
      'proof_of_deliveries',
      'inventory_transactions',
      'warehouse_inventory',
      'support_tickets',
      'notifications',
      'drivers',
      'vehicles',
      'warehouses',
      'routes',
      'products'
    ];

    console.log('--- TABLE RECORD COUNTS ---');
    for (const t of tables) {
      try {
        const res = await client.query(`SELECT COUNT(*) FROM ${t}`);
        console.log(`${t.padEnd(28)}: ${res.rows[0].count}`);
      } catch (err) {
        console.log(`${t.padEnd(28)}: [ERROR: ${err.message}]`);
      }
    }

    // 2. Customers and Users List
    console.log('\n--- USERS ---');
    const usersRes = await client.query('SELECT id, email, full_name, role, status, warehouse_id, created_at FROM users ORDER BY id');
    console.table(usersRes.rows);

    console.log('\n--- CUSTOMERS ---');
    const custRes = await client.query('SELECT id, user_id, full_name, email, phone, company_name, gst_number, status, created_at FROM customers ORDER BY id');
    console.table(custRes.rows);

    // 3. Orders List
    console.log('\n--- ORDERS (All) ---');
    const ordRes = await client.query(`
      SELECT o.id, o.order_number, o.customer_id, c.full_name as customer_name, c.email as customer_email,
             o.status, o.total_amount, o.payment_method, o.payment_status, o.created_at
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      ORDER BY o.id
    `);
    console.table(ordRes.rows);

    // 4. Shipments List
    console.log('\n--- SHIPMENTS (All) ---');
    const shRes = await client.query(`
      SELECT s.id, s.tracking_number, s.order_id, s.status, s.operational_stage, s.driver_id, d.full_name as driver_name,
             s.vehicle_id, s.origin_warehouse_id, s.destination_warehouse_id, s.created_at
      FROM shipments s
      LEFT JOIN drivers d ON s.driver_id = d.id
      ORDER BY s.id
    `);
    console.table(shRes.rows);

    // 5. Invoices List
    console.log('\n--- INVOICES (All) ---');
    const invRes = await client.query(`
      SELECT i.id, i.invoice_number, i.order_id, i.customer_id, i.total_amount, i.payment_method, i.payment_status, i.status, i.created_at
      FROM invoices i
      ORDER BY i.id
    `);
    console.table(invRes.rows);

    // 6. Proof of Deliveries
    console.log('\n--- PROOF OF DELIVERIES ---');
    const podRes = await client.query('SELECT id, shipment_id, recipient_name, received_by, delivered_at, created_at FROM proof_of_deliveries ORDER BY id');
    console.table(podRes.rows);

    // 7. Support Tickets
    console.log('\n--- SUPPORT TICKETS ---');
    const tktRes = await client.query('SELECT id, ticket_number, customer_name, customer_email, category, priority, status, created_at FROM support_tickets ORDER BY id');
    console.table(tktRes.rows);

    // 8. Notifications
    console.log('\n--- NOTIFICATIONS ---');
    const notifRes = await client.query('SELECT id, user_id, title, type, is_read, created_at FROM notifications ORDER BY id');
    console.table(notifRes.rows);

    // 9. Drivers and Vehicles
    console.log('\n--- DRIVERS ---');
    const drvRes = await client.query('SELECT id, full_name, email, status, warehouse_id, user_id FROM drivers ORDER BY id');
    console.table(drvRes.rows);

    console.log('\n--- VEHICLES ---');
    const vehRes = await client.query('SELECT id, vehicle_number, vehicle_type, status, warehouse_id, assigned_driver_id FROM vehicles ORDER BY id');
    console.table(vehRes.rows);

    await client.end();
  } catch (err) {
    console.error('Inspection failed:', err);
  }
}

main();
