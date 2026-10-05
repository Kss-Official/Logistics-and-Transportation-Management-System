const { execSync } = require('child_process');

try {
  const psqlQuery = `
    UPDATE users 
    SET password = (SELECT password FROM users WHERE email = 'gudisahoo@gmail.com')
    WHERE email IN ('admin@primeroute.com', 'sanjanaaa.shru@gmail.com', 'shrutisanjanasahoo@gmail.com');
  `;
  const cmd = `powershell -Command "$env:PGPASSWORD = 'postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -c \\"${psqlQuery.replace(/\n/g, ' ')}\\""`;
  const res = execSync(cmd, { encoding: 'utf8' });
  console.log('Updated passwords:', res);
} catch (e) {
  console.error(e);
}
