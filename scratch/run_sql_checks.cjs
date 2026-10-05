const { execSync } = require('child_process');

process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

function query(sql) {
  const singleLine = sql.replace(/\s+/g, ' ').trim();
  return execSync(`${PSQL} -c "${singleLine}"`, { encoding: 'utf8', env: process.env });
}

console.log('Customer 4 Orders Breakdown:');
console.log(query("SELECT status, COUNT(*) FROM orders WHERE customer_id = 4 GROUP BY status ORDER BY status;"));

console.log('Customer 4 Total Orders Count:');
console.log(query("SELECT COUNT(*) as total_orders FROM orders WHERE customer_id = 4;"));

console.log('Customer 4 Shipments Breakdown:');
console.log(query("SELECT s.id, s.tracking_number, s.status as shipment_status, o.order_number, o.status as order_status FROM shipments s JOIN orders o ON s.order_id = o.id WHERE o.customer_id = 4 ORDER BY s.id;"));

console.log('Customer 2 (customer@primeroute.com) Orders Breakdown:');
console.log(query("SELECT status, COUNT(*) FROM orders WHERE customer_id = 2 GROUP BY status ORDER BY status;"));
