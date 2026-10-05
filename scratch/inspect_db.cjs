const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432 -X';

function query(sql) {
  const cmd = `${PSQL} -c "${sql.replace(/"/g, '\\"')}"`;
  return execSync(cmd, { encoding: 'utf8', env: process.env });
}

console.log("=== WAREHOUSES ===");
console.log(query("SELECT id, warehouse_code, warehouse_name, city, status, manager_name, manager_email FROM warehouses ORDER BY id;"));

console.log("=== DRIVERS ===");
console.log(query("SELECT id, full_name, email, phone, status, vehicle_id, warehouse_id FROM drivers ORDER BY id;"));

console.log("=== VEHICLES ===");
console.log(query("SELECT id, vehicle_number, model, status, warehouse_id, driver_id FROM vehicles ORDER BY id;"));

console.log("=== USERS (WAREHOUSE MANAGERS & ADMINS) ===");
console.log(query("SELECT id, full_name, email, role, warehouse_id FROM users WHERE role IN ('ROLE_WAREHOUSE_MANAGER', 'ROLE_ADMIN', 'WAREHOUSE_MANAGER', 'ADMIN') OR warehouse_id IS NOT NULL ORDER BY id;"));

console.log("=== SHIPMENTS ===");
console.log(query("SELECT id, tracking_number, status, origin_warehouse_id, destination_warehouse_id, driver_id, vehicle_id FROM shipments ORDER BY id;"));
