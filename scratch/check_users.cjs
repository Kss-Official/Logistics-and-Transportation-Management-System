const { execSync } = require('child_process');

try {
  const psqlQuery = 'SELECT id, email, role, full_name FROM users;';
  const cmd = `powershell -Command "$env:PGPASSWORD = 'postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -c \\"${psqlQuery}\\""`;
  const res = execSync(cmd, { encoding: 'utf8' });
  console.log('--- USERS ---');
  console.log(res);
} catch (e) {
  console.error(e);
}
