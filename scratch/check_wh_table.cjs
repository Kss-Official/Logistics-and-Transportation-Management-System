const { execSync } = require('child_process');
const out = execSync(`"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -c "SELECT id, warehouse_code, warehouse_name, status, manager_name, manager_email FROM warehouses ORDER BY id;"`, {
  env: { ...process.env, PGPASSWORD: 'postgres123' },
  encoding: 'utf8'
});
console.log(out);
