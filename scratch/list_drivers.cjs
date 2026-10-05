const { execSync } = require('child_process');

process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

console.log('=== DRIVERS TABLE ===');
console.log(execSync(`${PSQL} -c "SELECT * FROM drivers;"`, { encoding: 'utf8', env: process.env }));

console.log('=== SHIPMENTS ===');
console.log(execSync(`${PSQL} -c "SELECT id, tracking_number, status, driver_id, vehicle_id FROM shipments ORDER BY id;"`, { encoding: 'utf8', env: process.env }));
