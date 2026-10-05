const { execSync } = require('child_process');
const psqlPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe';

const users = execSync(`"${psqlPath}" -U postgres -d primeroute_db -c "SELECT id, email, role, status, warehouse_id FROM users;"`, {
  env: { ...process.env, PGPASSWORD: 'postgres123' },
  encoding: 'utf8'
});
console.log(users);
