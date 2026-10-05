const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

console.log('--- Today Count ---');
console.log(execSync(`${PSQL} -c "SELECT count(*) FROM orders WHERE created_at >= CURRENT_DATE;"`, { encoding: 'utf8', env: process.env }));

console.log('--- Recent Orders ---');
console.log(execSync(`${PSQL} -c "SELECT id, order_number, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5;"`, { encoding: 'utf8', env: process.env }));
