const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';
console.log('--- RECENT SHIPMENTS ---');
console.log(execSync(`${PSQL} -c "SELECT id, status, operational_stage, origin_warehouse_id, destination_warehouse_id, driver_id, vehicle_id, order_id FROM shipments ORDER BY id DESC LIMIT 5;"`, { encoding: 'utf8', env: process.env }));
console.log('--- RECENT ORDERS ---');
console.log(execSync(`${PSQL} -c "SELECT id, order_number, status, origin_warehouse_id FROM orders ORDER BY id DESC LIMIT 5;"`, { encoding: 'utf8', env: process.env }));
