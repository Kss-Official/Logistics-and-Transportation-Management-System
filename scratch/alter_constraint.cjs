const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

try {
  console.log('Altering users constraint...');
  const res = execSync(`${PSQL} -c "ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check; ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role in ('ADMIN', 'CUSTOMER', 'WAREHOUSE_MANAGER', 'DRIVER'));"`, { encoding: 'utf8', env: process.env });
  console.log(res);
} catch(e) {
  console.error(e.message);
}
