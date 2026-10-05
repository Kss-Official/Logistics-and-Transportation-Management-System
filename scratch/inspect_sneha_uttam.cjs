const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

const sql = "SELECT s.id, s.tracking_number, s.status, s.driver_id, d.full_name, s.order_id, o.order_number, s.created_at, s.updated_at FROM shipments s LEFT JOIN drivers d ON s.driver_id = d.id LEFT JOIN orders o ON s.order_id = o.id WHERE d.id IN (16, 19) ORDER BY s.id;";
console.log(execSync(`${PSQL} -c "${sql}"`, { encoding: 'utf8', env: process.env }));
