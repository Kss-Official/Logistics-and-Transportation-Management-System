const { execSync } = require('child_process');

function runSql(query) {
  const singleLine = query.replace(/\r?\n/g, ' ');
  const cmd = `powershell -Command "$env:PGPASSWORD='postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -h localhost -p 5432 -c \\"${singleLine}\\""`;
  return execSync(cmd, { encoding: 'utf8' });
}

// Copy password hash from priya (Manager@2026!) or ramesh (Driver@2026!) to shrutisanjanasahoo
runSql("UPDATE users SET password = (SELECT password FROM users WHERE email = 'ramesh@primeroute.com') WHERE email = 'shrutisanjanasahoo@gmail.com';");
console.log('Password hash updated for shrutisanjanasahoo@gmail.com (same as Driver@2026!)');
