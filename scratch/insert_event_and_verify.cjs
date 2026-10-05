const { spawnSync } = require('child_process');
const psqlPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe';

function runSql(sql) {
  const res = spawnSync(psqlPath, ['-U', 'postgres', '-d', 'primeroute_db', '-c', sql], {
    env: { ...process.env, PGPASSWORD: 'postgres123' },
    encoding: 'utf8'
  });
  console.log('--- SQL RESULT ---');
  console.log(res.stdout);
  if (res.stderr) console.error(res.stderr);
}

runSql("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'shipment_tracking_events';");

runSql(`
  INSERT INTO shipment_tracking_events (
    id, shipment_id, status, title, location_name, description, event_time
  ) VALUES (
    (SELECT COALESCE(MAX(id), 0) + 1 FROM shipment_tracking_events),
    546, 'CONFIRMED', 'Order Created & Confirmed', 'Bengaluru Origin Terminal',
    'Booking reference PR-ORD-96307644 registered and logistics order confirmed.', NOW()
  ) RETURNING id, shipment_id, status, title;
`);

console.log('=== VERIFY ORDER 737 COMPLETE RECORD ===');
runSql("SELECT id, order_number, origin_warehouse_id, status FROM orders WHERE id = 737;");
runSql("SELECT id, order_id, warehouse_id, allocation_status, reason FROM fulfillment_allocations WHERE order_id = 737;");
runSql("SELECT id, order_id, origin_warehouse_id, tracking_number, status, operational_stage FROM shipments WHERE order_id = 737;");
runSql("SELECT id, shipment_id, status, title, location_name FROM shipment_tracking_events WHERE shipment_id = 546;");
