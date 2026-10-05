const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

console.log(execSync(`${PSQL} -c "SELECT o.id, o.order_number, o.status, s.id as shipment_id, s.tracking_number, s.status as shipment_status, d.full_name as driver FROM orders o LEFT JOIN shipments s ON s.order_id = o.id LEFT JOIN drivers d ON s.driver_id = d.id WHERE o.id IN (32, 35);"`, { encoding: 'utf8', env: process.env }));
