const { execSync } = require('child_process');

try {
  const drivers = execSync(`"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -c "SELECT id, full_name, email, status, license_number FROM drivers LIMIT 10;"`, {
    env: { ...process.env, PGPASSWORD: 'postgres123' },
    encoding: 'utf8'
  });
  console.log("DRIVERS:\n", drivers);

  const vehicles = execSync(`"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -c "SELECT id, vehicle_number, driver_id, status, warehouse_id FROM vehicles LIMIT 10;"`, {
    env: { ...process.env, PGPASSWORD: 'postgres123' },
    encoding: 'utf8'
  });
  console.log("VEHICLES:\n", vehicles);

  const shipments = execSync(`"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -c "SELECT id, tracking_number, origin_warehouse_id, driver_id, vehicle_id, status, assignment_status, assigned_by FROM shipments LIMIT 10;"`, {
    env: { ...process.env, PGPASSWORD: 'postgres123' },
    encoding: 'utf8'
  });
  console.log("SHIPMENTS:\n", shipments);
} catch (e) {
  console.error(e.message);
}
