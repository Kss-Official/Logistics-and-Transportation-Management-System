const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

const sql = "SELECT v.id, v.vehicle_number, v.model, v.status FROM vehicles v WHERE v.status NOT IN ('INACTIVE', 'MAINTENANCE') AND NOT EXISTS (SELECT 1 FROM shipments s WHERE s.vehicle_id = v.id AND s.status NOT IN ('DELIVERED', 'CANCELLED')) ORDER BY v.id ASC;";
console.log('--- AVAILABLE VEHICLES ---');
console.log(execSync(`${PSQL} -c "${sql}"`, { encoding: 'utf8', env: process.env }));

console.log('--- ALL VEHICLES WITH ACTIVE SHIPMENT ---');
const sqlAll = `
SELECT v.id, v.vehicle_number, v.model, v.status,
  COUNT(s.id) FILTER (WHERE s.status NOT IN ('DELIVERED', 'CANCELLED')) as active_count
FROM vehicles v
LEFT JOIN shipments s ON s.vehicle_id = v.id
GROUP BY v.id, v.vehicle_number, v.model, v.status
ORDER BY v.id;
`;
console.log(execSync(`${PSQL} -c "${sqlAll}"`, { encoding: 'utf8', env: process.env }));
