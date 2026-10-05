const { execSync } = require('child_process');

process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

try {
  const res = execSync(`${PSQL} -c "SELECT id, email, role, status, LENGTH(password) as pwd_len, (password LIKE '$2%') as is_bcrypt, last_password_change FROM users;"`, { encoding: 'utf8', env: process.env });
  console.log(res);
} catch (err) {
  console.error('PSQL error:', err.message);
}
