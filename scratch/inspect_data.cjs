const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432 -X';

function query(sql) {
  const cmd = `${PSQL} -c "${sql.replace(/"/g, '\\"')}"`;
  return execSync(cmd, { encoding: 'utf8', env: process.env });
}

console.log("=== FOREIGN KEYS ===");
console.log(query(`
SELECT
    conrelid::regclass AS from_table,
    a.attname AS from_column,
    confrelid::regclass AS to_table,
    af.attname AS to_column,
    conname AS constraint_name
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
WHERE c.contype = 'f'
ORDER BY from_table, to_table;
`));

console.log("=== ALL WAREHOUSES ===");
console.log(query("SELECT id, warehouse_code, warehouse_name, city, status, manager_name, manager_email FROM warehouses ORDER BY id;"));

console.log("=== ALL DRIVERS ===");
console.log(query("SELECT id, full_name, email, phone, status, warehouse_id FROM drivers ORDER BY id;"));

console.log("=== ALL VEHICLES ===");
console.log(query("SELECT id, vehicle_number, model, status, warehouse_id, driver_id FROM vehicles ORDER BY id;"));

console.log("=== ALL USERS (WAREHOUSE MANAGERS & ADMINS) ===");
console.log(query("SELECT id, full_name, email, role, warehouse_id, status FROM users ORDER BY id;"));

console.log("=== ALL SHIPMENTS ===");
console.log(query("SELECT id, tracking_number, status, origin_warehouse_id, destination_warehouse_id, driver_id, vehicle_id FROM shipments ORDER BY id;"));
