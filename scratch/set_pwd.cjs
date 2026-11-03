const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

execSync(`${PSQL} -c "UPDATE users SET password = (SELECT password FROM users WHERE email = 'admin@primeroute.com') WHERE email = 'shrutisanjanasahoo@gmail.com';"`, {
  encoding: 'utf8',
  env: process.env
});
console.log('shrutisanjanasahoo updated with Password@123 hash.');
