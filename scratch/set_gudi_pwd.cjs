const { execSync } = require('child_process');

try {
  const psqlQuery = `
    UPDATE users 
    SET password = (SELECT password FROM users WHERE email = 'temp_hash_probe@primeroute.com')
    WHERE email = 'gudisahoo@gmail.com';

    DELETE FROM users WHERE email = 'temp_hash_probe@primeroute.com';
  `;
  const cmd = `powershell -Command "$env:PGPASSWORD = 'postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -c \\"${psqlQuery.replace(/\n/g, ' ')}\\""`;
  const res = execSync(cmd, { encoding: 'utf8' });
  console.log('Result:', res);
} catch (e) {
  console.error(e);
}
