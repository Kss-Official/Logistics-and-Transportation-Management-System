const { execSync } = require('child_process');

const psqlCmd = `"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -c`;

function runSql(query) {
  return execSync(`${psqlCmd} "${query}"`, {
    env: { ...process.env, PGPASSWORD: 'postgres123' },
    encoding: 'utf8'
  });
}

console.log("=== DRIVERS ===");
console.log(runSql("SELECT id, full_name, email, status, license_number FROM drivers;"));

console.log("=== VEHICLES ===");
console.log(runSql("SELECT id, vehicle_number, driver_id, status, warehouse_id FROM vehicles;"));

console.log("=== SHIPMENTS 3 and 4 ===");
console.log(runSql("SELECT id, tracking_number, origin_warehouse_id, driver_id, vehicle_id, status, assignment_status, assigned_by FROM shipments WHERE id IN (3, 4);"));
