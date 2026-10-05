const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';
console.log('--- TOKENS FOR USER 1 ---');
console.log(execSync(`${PSQL} -c "SELECT id, user_id, used, expiry_date, created_at FROM password_reset_tokens WHERE user_id=1 ORDER BY id DESC LIMIT 5;"`, { encoding: 'utf8', env: process.env }));
console.log('--- USER 1 ---');
console.log(execSync(`${PSQL} -c "SELECT id, email, role, last_password_change, password FROM users WHERE id=1;"`, { encoding: 'utf8', env: process.env }));
