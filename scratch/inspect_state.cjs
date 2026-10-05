const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';

function runSql(sql) {
  const singleLine = sql.replace(/\s+/g, ' ').trim();
  const cmd = `"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432 -c "${singleLine}"`;
  return execSync(cmd, { encoding: 'utf8', env: process.env });
}

console.log('=== VEHICLES AND THEIR ASSIGNED DRIVERS ===');
console.log(runSql('SELECT v.id AS vehicle_id, v.vehicle_number, v.driver_id AS assigned_driver_id, d.full_name AS assigned_driver_name, v.status FROM vehicles v LEFT JOIN drivers d ON v.driver_id = d.id ORDER BY v.id;'));

console.log('=== ACTIVE SHIPMENTS WITH VEHICLES OR DRIVERS ===');
console.log(runSql("SELECT s.id, s.tracking_number, s.status, s.driver_id, d.full_name AS driver_name, s.vehicle_id, v.vehicle_number, v.driver_id AS veh_driver_id FROM shipments s LEFT JOIN drivers d ON s.driver_id = d.id LEFT JOIN vehicles v ON s.vehicle_id = v.id WHERE s.status NOT IN ('DELIVERED', 'CANCELLED') AND (s.driver_id IS NOT NULL OR s.vehicle_id IS NOT NULL) ORDER BY s.id;"));
