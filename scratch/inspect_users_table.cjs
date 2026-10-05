const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';
const sql = "SELECT id, email, full_name, role, status, warehouse_id, length(password) as pw_len, substring(password from 1 for 10) as hash_prefix FROM users ORDER BY id;";
console.log(execSync(`${PSQL} -c "${sql}"`, { encoding: 'utf8', env: process.env }));
