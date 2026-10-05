const { execSync } = require('child_process');

try {
  const psqlCmd = `powershell -Command "$env:PGPASSWORD = 'postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -c \\"UPDATE users SET password = (SELECT password FROM users WHERE email = 'customer@primeroute.com'), status = 'ACTIVE' WHERE email = 'shrutisanjanasahoo@gmail.com';\\""`;
  const result = execSync(psqlCmd, { encoding: 'utf8' });
  console.log(result);
  console.log('Successfully synced password for shrutisanjanasahoo@gmail.com to customer123');
} catch (err) {
  console.error('Failed to sync password:', err.message);
}
