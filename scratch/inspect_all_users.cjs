const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

console.log('--- Orders for customer_id 4 ---');
console.log(execSync(`${PSQL} -c "SELECT id, order_number, customer_id, status FROM orders WHERE customer_id = 4 LIMIT 5;"`, { encoding: 'utf8', env: process.env }));
