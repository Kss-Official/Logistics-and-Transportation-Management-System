const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

const res = execSync(`${PSQL} -c "SELECT s.id, s.tracking_number, s.status, o.customer_id FROM shipments s LEFT JOIN orders o ON s.order_id = o.id;"`, { encoding: 'utf8', env: process.env });
console.log(res);
