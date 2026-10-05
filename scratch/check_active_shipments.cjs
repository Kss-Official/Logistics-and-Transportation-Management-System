const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432 -X';

function query(sql) {
  const cmd = `${PSQL} -c "${sql.replace(/"/g, '\\"')}"`;
  return execSync(cmd, { encoding: 'utf8', env: process.env });
}

console.log("=== ACTIVE SHIPMENTS ===");
console.log(query(`
SELECT s.id, s.tracking_number, s.status, s.operational_stage, s.origin_warehouse_id, s.destination_warehouse_id, s.driver_id, d.full_name as driver_name, s.vehicle_id, v.vehicle_number
FROM shipments s
LEFT JOIN drivers d ON d.id = s.driver_id
LEFT JOIN vehicles v ON v.id = s.vehicle_id
WHERE s.status NOT IN ('DELIVERED', 'CANCELLED')
ORDER BY s.id;
`));
