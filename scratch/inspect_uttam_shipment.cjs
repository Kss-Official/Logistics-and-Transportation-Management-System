const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

console.log(execSync(`${PSQL} -c "SELECT id, tracking_number, status, driver_id, vehicle_id, order_id, created_at, updated_at FROM shipments WHERE tracking_number = 'TRK-PR-KT455SFX';"`, { encoding: 'utf8', env: process.env }));
