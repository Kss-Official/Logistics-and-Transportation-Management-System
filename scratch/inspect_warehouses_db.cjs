const { execSync } = require('child_process');

try {
  const psqlCmd = `powershell -Command "$env:PGPASSWORD = 'postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -h localhost -c 'SELECT * FROM warehouses ORDER BY id;'"`
  console.log(execSync(psqlCmd).toString());
} catch (e) {
  console.error(e.message);
}
