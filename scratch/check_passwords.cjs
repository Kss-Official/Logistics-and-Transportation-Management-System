const { execSync } = require('child_process');

try {
  const psqlCmd = `powershell -Command "$env:PGPASSWORD = 'postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -c \\"SELECT id, email, password FROM users WHERE email IN ('customer@primeroute.com', 'shrutisanjanasahoo@gmail.com');\\""`;
  const result = execSync(psqlCmd, { encoding: 'utf8' });
  console.log(result);
} catch (err) {
  console.error('Failed to query DB:', err.message);
}
