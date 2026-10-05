const { execSync } = require('child_process');
const psqlPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe';

function query(sql) {
  try {
    return execSync(`"${psqlPath}" -U postgres -d primeroute_db -c "${sql}"`, {
      env: { ...process.env, PGPASSWORD: 'postgres123' },
      encoding: 'utf8'
    });
  } catch (err) {
    return 'Error: ' + err.message + '\n' + (err.stderr ? err.stderr.toString() : '');
  }
}

console.log('=== ORDERS ===');
console.log(query("SELECT id, order_number, origin_warehouse_id, pickup_address_id, delivery_address_id, customer_id, status, created_at FROM orders WHERE id=737 OR order_number='PR-ORD-96307644';"));

console.log('=== ALLOCATIONS ===');
console.log(query("SELECT * FROM fulfillment_allocations WHERE order_id=737;"));

console.log('=== SHIPMENTS ===');
console.log(query("SELECT id, tracking_number, origin_warehouse_id, status, created_at FROM shipments WHERE order_id=737;"));

console.log('=== ADDRESSES ===');
console.log(query("SELECT id, address_line1, address_line2, city, state, postal_code, country FROM addresses WHERE id IN (SELECT pickup_address_id FROM orders WHERE id=737 UNION SELECT delivery_address_id FROM orders WHERE id=737);"));

console.log('=== WAREHOUSES ===');
console.log(query("SELECT id, warehouse_code, warehouse_name, city, state, postal_code, status, latitude, longitude FROM warehouses;"));
