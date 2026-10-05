const { execSync } = require('child_process');

function runSql(query) {
  try {
    const cmd = `powershell -Command "$env:PGPASSWORD='postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -h localhost -p 5432 -c \\"${query}\\" -t -A"`;
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch (e) {
    console.error('SQL Error:', e.message);
    return null;
  }
}

console.log('--- DRIVERS ---');
console.log(runSql("SELECT id, full_name, email, status, warehouse_id FROM drivers;"));

console.log('\n--- VEHICLES ---');
console.log(runSql("SELECT id, vehicle_number, model, status, warehouse_id FROM vehicles;"));
