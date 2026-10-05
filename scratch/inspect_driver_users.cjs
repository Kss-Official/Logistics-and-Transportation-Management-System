const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

function query(sql) {
  return execSync(`${PSQL} -c "${sql}"`, { encoding: 'utf8', env: process.env });
}

console.log('--- DRIVER USERS IN USERS TABLE ---');
console.log(query("SELECT id, email, role, status, password FROM users WHERE role = 'DRIVER' OR email LIKE '%priya%' OR email LIKE '%ramesh%' OR email LIKE '%sneha%';"));

console.log('--- DRIVERS IN DRIVERS TABLE ---');
console.log(query("SELECT id, name, email, warehouse_id, status FROM drivers;"));
