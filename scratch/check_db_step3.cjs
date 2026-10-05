const { execSync } = require('child_process');

function runPsql(sql) {
  return execSync(`"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -c "${sql}"`, {
    env: { ...process.env, PGPASSWORD: 'postgres123' },
    encoding: 'utf8'
  });
}

console.log("=== WAREHOUSES ===");
console.log(runPsql("SELECT id, warehouse_code, warehouse_name, city, manager_name, manager_email FROM warehouses ORDER BY id LIMIT 5;"));

console.log("=== USERS (WAREHOUSE MANAGERS) ===");
console.log(runPsql("SELECT id, email, full_name, role, warehouse_id FROM users WHERE role = 'WAREHOUSE_MANAGER' ORDER BY id LIMIT 5;"));

console.log("=== SHIPMENTS SAMPLE ===");
console.log(runPsql("SELECT id, tracking_number, origin_warehouse_id, status FROM shipments ORDER BY id LIMIT 5;"));
