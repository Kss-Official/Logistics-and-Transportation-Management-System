const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

console.log(execSync(`${PSQL} -c "UPDATE users SET role = 'CUSTOMER', warehouse_id = NULL WHERE email = 'shrutisanjanasahoo@gmail.com';"`, { encoding: 'utf8', env: process.env }));
console.log(execSync(`${PSQL} -c "UPDATE warehouses SET manager_email = 'blr.hub@primeroute.com', manager_name = 'Bengaluru Operations' WHERE id = 8;"`, { encoding: 'utf8', env: process.env }));

console.log('--- Verification ---');
console.log(execSync(`${PSQL} -c "SELECT id, email, full_name, role, warehouse_id FROM users WHERE email = 'shrutisanjanasahoo@gmail.com';"`, { encoding: 'utf8', env: process.env }));
