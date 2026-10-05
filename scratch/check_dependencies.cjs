const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432 -X';

function query(sql) {
  const cmd = `${PSQL} -c "${sql.replace(/"/g, '\\"')}"`;
  return execSync(cmd, { encoding: 'utf8', env: process.env });
}

console.log("=== INVENTORIES ===");
console.log(query("SELECT warehouse_id, count(*) FROM inventories GROUP BY warehouse_id;"));

console.log("=== INVENTORY TRANSACTIONS ===");
console.log(query("SELECT warehouse_id, count(*) FROM inventory_transactions GROUP BY warehouse_id;"));

console.log("=== FULFILLMENT ALLOCATIONS ===");
console.log(query("SELECT warehouse_id, count(*) FROM fulfillment_allocations GROUP BY warehouse_id;"));

console.log("=== ORDERS ===");
console.log(query("SELECT id, order_number, status, origin_warehouse_id, destination_warehouse_id FROM orders;"));

console.log("=== ROUTES ===");
console.log(query("SELECT id, route_name, origin_warehouse_id, destination_warehouse_id FROM routes;"));
