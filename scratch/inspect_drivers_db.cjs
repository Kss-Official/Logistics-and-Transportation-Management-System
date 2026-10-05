const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

console.log('=== DRIVERS IN DB ===');
console.log(execSync(`${PSQL} -c "SELECT id, full_name, phone, license_number, status FROM drivers ORDER BY id;"`, { encoding: 'utf8', env: process.env }));

console.log('=== SHIPMENTS FOR DRIVERS ===');
console.log(execSync(`${PSQL} -c "SELECT s.id, s.tracking_number, s.status, s.driver_id, d.full_name FROM shipments s LEFT JOIN drivers d ON s.driver_id = d.id WHERE s.driver_id IS NOT NULL ORDER BY s.driver_id, s.id;"`, { encoding: 'utf8', env: process.env }));
