const { execSync } = require('child_process');
const psqlPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe';

function query(sql) {
  return execSync(`"${psqlPath}" -U postgres -d primeroute_db -c "${sql}"`, {
    env: { ...process.env, PGPASSWORD: 'postgres123' },
    encoding: 'utf8'
  });
}

console.log('--- ORDER 737 CURRENT STATUS ---');
console.log(query("SELECT id, order_number, status, origin_warehouse_id FROM orders WHERE id=737;"));
console.log(query("SELECT id, tracking_number, status, operational_stage, origin_warehouse_id FROM shipments WHERE order_id=737;"));

// Reset Order 737 and its shipment to CONFIRMED / READY_FOR_PROCESSING if needed
console.log(query("UPDATE orders SET status = 'CONFIRMED' WHERE id = 737;"));
console.log(query("UPDATE shipments SET status = 'CONFIRMED', operational_stage = 'READY_FOR_PROCESSING' WHERE order_id = 737;"));

console.log('--- AFTER RESET ---');
console.log(query("SELECT id, order_number, status, origin_warehouse_id FROM orders WHERE id=737;"));
console.log(query("SELECT id, tracking_number, status, operational_stage, origin_warehouse_id FROM shipments WHERE order_id=737;"));
