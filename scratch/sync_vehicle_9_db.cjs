const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

console.log(execSync(`${PSQL} -c "UPDATE vehicles SET driver_id = 13 WHERE id = 9;"`, { env: process.env, encoding: 'utf8' }));
console.log(execSync(`${PSQL} -c "SELECT id, vehicle_number, driver_id, status FROM vehicles WHERE id = 9;"`, { env: process.env, encoding: 'utf8' }));
console.log(execSync(`${PSQL} -c "SELECT id, tracking_number, driver_id, vehicle_id, status FROM shipments WHERE id = 24;"`, { env: process.env, encoding: 'utf8' }));
