const { execFileSync } = require('child_process');
const fs = require('fs');

const psqlPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe';
const env = { ...process.env, PGPASSWORD: 'postgres123' };

function psql(query) {
  try {
    return execFileSync(psqlPath, ['-U', 'postgres', '-d', 'primeroute_db', '-c', query], { env, encoding: 'utf8' });
  } catch (err) {
    return `[ERROR: ${err.message}]`;
  }
}

let report = '';
function log(title, query) {
  const res = psql(query);
  report += `\n==================== ${title} ====================\n` + res;
  console.log(`\n==================== ${title} ====================\n` + res);
}

log('ALL TABLES', "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;");
log('1. USERS', 'SELECT id, email, full_name, role, status, warehouse_id FROM users ORDER BY id;');
log('2. ORDERS', 'SELECT o.id, o.order_number, o.customer_id, u.email as user_email, u.full_name as user_name, o.status, o.total_amount, o.payment_method, o.payment_status, o.created_at FROM orders o LEFT JOIN users u ON o.customer_id = u.id ORDER BY o.id;');
log('3. SHIPMENTS', 'SELECT s.id, s.tracking_number, s.order_id, s.status, s.operational_stage, s.driver_id, d.full_name as driver_name, s.vehicle_id, s.origin_warehouse_id, s.destination_warehouse_id, s.created_at FROM shipments s LEFT JOIN drivers d ON s.driver_id = d.id ORDER BY s.id;');
log('4. INVOICES', 'SELECT i.id, i.invoice_number, i.order_id, i.customer_id, i.total_amount, i.payment_method, i.payment_status, i.invoice_status, i.created_at FROM invoices i ORDER BY i.id;');
log('5. PROOF OF DELIVERIES', 'SELECT id, shipment_id, recipient_name, received_by, delivered_at FROM proof_of_deliveries ORDER BY id;');
log('6. SUPPORT TICKETS', 'SELECT id, ticket_number, customer_name, customer_email, category, priority, status FROM support_tickets ORDER BY id;');
log('7. NOTIFICATIONS', 'SELECT id, user_id, title, type, is_read, created_at FROM notifications ORDER BY id;');
log('8. DRIVERS', 'SELECT id, full_name, email, phone, status, warehouse_id, user_id FROM drivers ORDER BY id;');
log('9. VEHICLES', 'SELECT id, vehicle_number, vehicle_type, capacity, fuel_type, status, warehouse_id FROM vehicles ORDER BY id;');
log('10. WAREHOUSES', 'SELECT id, warehouse_code, warehouse_name, city, state, capacity, current_utilization, status FROM warehouses ORDER BY id;');
log('11. ROUTES', 'SELECT id, route_code, origin_warehouse_id, destination_warehouse_id, distance_km, estimated_hours, status FROM routes ORDER BY id;');
log('12. PRODUCTS', 'SELECT id, sku, name, category, unit_price, weight_kg FROM products ORDER BY id;');
log('13. ADDRESSES', 'SELECT id, user_id, customer_name, address_line1, city, state, postal_code, is_default FROM addresses ORDER BY id;');
log('14. FULFILLMENT ALLOCATIONS', 'SELECT * FROM fulfillment_allocations ORDER BY id;');
log('15. INVENTORY TRANSACTIONS', 'SELECT * FROM inventory_transactions ORDER BY id;');

fs.writeFileSync('d:/Transportation-Logistic/scratch/db_full_dump.txt', report);
