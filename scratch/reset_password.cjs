const { execSync } = require('child_process');

try {
  const psqlCmd = `powershell -Command "$env:PGPASSWORD = 'postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -c \\"UPDATE users SET password = '$2a$10$TRHwvrCFP4cn6vOGqyNiiOIvxmkLkGUTU89o19yyPYDt2.BOEKsQW', status = 'ACTIVE' WHERE email = 'shrutisanjanasahoo@gmail.com';\\""`;
  const result = execSync(psqlCmd, { encoding: 'utf8' });
  console.log(result);
  console.log('Password updated for shrutisanjanasahoo@gmail.com to customer123');
} catch (err) {
  console.error('Failed to update password:', err.message);
}
