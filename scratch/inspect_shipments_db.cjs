const { execSync } = require('child_process');

try {
  const psqlCmd = `powershell -Command "$env:PGPASSWORD = 'postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -h localhost -c 'SELECT id, tracking_number, status, operational_stage, origin_warehouse_id, destination_warehouse_id, driver_id, vehicle_id FROM shipments ORDER BY id;'"`
  console.log(execSync(psqlCmd).toString());
} catch (e) {
  console.error(e.message);
}
