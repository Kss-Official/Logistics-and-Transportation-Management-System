const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

console.log(execSync(`${PSQL} -c "SELECT id, tracking_number, status, driver_id, current_location_name FROM shipments WHERE id >= 21;"`, { encoding: 'utf8', env: process.env }));
