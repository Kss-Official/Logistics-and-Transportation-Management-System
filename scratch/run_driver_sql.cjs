const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

const sql = "SELECT d.id, d.full_name, d.phone, d.license_number, d.status FROM drivers d WHERE d.status != 'INACTIVE' AND NOT EXISTS (SELECT 1 FROM shipments s WHERE s.driver_id = d.id AND s.status NOT IN ('DELIVERED', 'CANCELLED')) ORDER BY d.full_name ASC;";
console.log(execSync(`${PSQL} -c "${sql}"`, { encoding: 'utf8', env: process.env }));
