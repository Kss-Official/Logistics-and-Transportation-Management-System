const { execSync } = require('child_process');

function runPsql(sql) {
  return execSync(`"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -c "${sql}"`, {
    env: { ...process.env, PGPASSWORD: 'postgres123' },
    encoding: 'utf8'
  });
}

console.log(runPsql("SELECT id, email, full_name, role, warehouse_id FROM users WHERE email = 'mum.west@primeroute.com';"));
