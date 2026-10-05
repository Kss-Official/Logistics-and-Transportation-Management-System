const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

console.log('--- ALL DRIVERS ---');
console.log(execSync(`${PSQL} -c "SELECT id, full_name, phone, license_number, status FROM drivers ORDER BY id;"`, { encoding: 'utf8', env: process.env }));

console.log('--- SHIPMENTS WITH DRIVERS ---');
console.log(execSync(`${PSQL} -c "SELECT s.id, s.tracking_number, s.status, s.driver_id, d.full_name, s.vehicle_id FROM shipments s LEFT JOIN drivers d ON s.driver_id = d.id ORDER BY s.id;"`, { encoding: 'utf8', env: process.env }));
