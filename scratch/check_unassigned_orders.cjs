const { execSync } = require('child_process');

const PSQL = `"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -c`;

function runSql(query) {
  return execSync(`${PSQL} "${query}"`, {
    env: { ...process.env, PGPASSWORD: 'postgres123' },
    encoding: 'utf8'
  });
}

console.log("=== ORDERS WITHOUT SHIPMENTS ===");
console.log(runSql(`SELECT o.id, o.order_number, o.status, o.customer_id, o.origin_warehouse_id FROM orders o LEFT JOIN shipments s ON s.order_id = o.id WHERE s.id IS NULL;`));

console.log("=== RECENT SHIPMENTS ===");
console.log(runSql(`SELECT id, tracking_number, order_id, origin_warehouse_id, status, assignment_status, assigned_by FROM shipments ORDER BY id DESC LIMIT 5;`));
