const { execFileSync } = require('child_process');

const psqlPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe';
const env = { ...process.env, PGPASSWORD: 'postgres123' };

function psql(query) {
  return execFileSync(psqlPath, ['-U', 'postgres', '-d', 'primeroute_db', '-c', query], { env, encoding: 'utf8' });
}

function verify() {
  console.log('============================================================');
  console.log('POST-CLEANUP VERIFICATION & MASTER DATA INTEGRITY AUDIT');
  console.log('============================================================\n');

  console.log('--- 1. USERS ---');
  console.log(psql('SELECT id, email, full_name, role, status, warehouse_id FROM users ORDER BY id;'));

  console.log('--- 2. ORDERS ---');
  console.log(psql('SELECT o.id, o.order_number, o.customer_id, u.email as user_email, u.full_name as user_name, o.status, o.total_amount, o.payment_method, o.payment_status FROM orders o LEFT JOIN users u ON o.customer_id = u.id ORDER BY o.id;'));

  console.log('--- 3. SHIPMENTS ---');
  console.log(psql('SELECT s.id, s.tracking_number, s.order_id, s.status, s.operational_stage, s.driver_id, d.full_name as driver_name, s.vehicle_id, s.origin_warehouse_id, s.destination_warehouse_id FROM shipments s LEFT JOIN drivers d ON s.driver_id = d.id ORDER BY s.id;'));

  console.log('--- 4. INVOICES ---');
  console.log(psql('SELECT i.id, i.invoice_number, i.order_id, i.customer_id, i.total_amount, i.payment_method, i.payment_status, i.invoice_status FROM invoices i ORDER BY id;'));

  console.log('--- 5. PROOF OF DELIVERIES ---');
  console.log(psql('SELECT id, shipment_id, recipient_name, received_by, delivered_at FROM proof_of_deliveries ORDER BY id;'));

  console.log('--- 6. WAREHOUSES ---');
  console.log(psql('SELECT id, warehouse_code, warehouse_name, city, status FROM warehouses ORDER BY id;'));

  console.log('--- 7. DRIVERS ---');
  console.log(psql('SELECT id, full_name, email, phone, license_number, status, warehouse_id FROM drivers ORDER BY id;'));

  console.log('--- 8. VEHICLES ---');
  console.log(psql('SELECT id, vehicle_number, vehicle_type, model, capacity, registration_number, status, warehouse_id, driver_id FROM vehicles ORDER BY id;'));

  console.log('--- 9. INVENTORIES (Warehouse Stock Integrity) ---');
  console.log(psql('SELECT id, warehouse_id, sku, product_name, total_stock, reserved_stock, available_stock, damaged_stock FROM inventories ORDER BY warehouse_id, id;'));

  console.log('--- 10. ORPHAN INTEGRITY CHECKS ---');
  const orphanChecks = [
    { desc: 'Shipments without Orders', sql: 'SELECT count(*) FROM shipments WHERE order_id NOT IN (SELECT id FROM orders);' },
    { desc: 'Invoices without Orders', sql: 'SELECT count(*) FROM invoices WHERE order_id NOT IN (SELECT id FROM orders);' },
    { desc: 'Proof of Deliveries without Shipments', sql: 'SELECT count(*) FROM proof_of_deliveries WHERE shipment_id NOT IN (SELECT id FROM shipments);' },
    { desc: 'Order Items without Orders', sql: 'SELECT count(*) FROM order_items WHERE order_id NOT IN (SELECT id FROM orders);' },
    { desc: 'Fulfillment Allocations without Orders', sql: 'SELECT count(*) FROM fulfillment_allocations WHERE order_id NOT IN (SELECT id FROM orders);' },
    { desc: 'Tracking Events without Shipments', sql: 'SELECT count(*) FROM shipment_tracking_events WHERE shipment_id NOT IN (SELECT id FROM shipments);' },
    { desc: 'Orders with Invalid Customer', sql: 'SELECT count(*) FROM orders WHERE customer_id NOT IN (SELECT id FROM users);' },
    { desc: 'Addresses with Invalid Customer', sql: 'SELECT count(*) FROM addresses WHERE customer_id NOT IN (SELECT id FROM users);' },
    { desc: 'Support Tickets with Invalid User', sql: 'SELECT count(*) FROM support_tickets WHERE customer_id NOT IN (SELECT id FROM users);' },
    { desc: 'Notifications with Invalid User', sql: 'SELECT count(*) FROM notifications WHERE user_id NOT IN (SELECT id FROM users);' },
  ];

  let orphanErrors = 0;
  for (const check of orphanChecks) {
    const res = psql(check.sql);
    const count = parseInt(res.match(/\d+/)[0], 10);
    const passed = count === 0;
    if (!passed) orphanErrors++;
    console.log(`${passed ? '✓' : '✗'} ${check.desc.padEnd(42)}: ${count} orphans`);
  }

  if (orphanErrors === 0) {
    console.log('\n>>> ALL ORPHAN CHECKS PASSED WITH ZERO ERRORS! <<<');
  } else {
    console.log(`\n>>> WARNING: ${orphanErrors} ORPHAN CHECK FAILURES DETECTED! <<<`);
  }
}

verify();
