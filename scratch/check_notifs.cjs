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

console.log('--- NOTIFICATIONS TABLE COLUMNS ---');
console.log(runSql("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'notifications';"));

console.log('\n--- RECENT NOTIFICATIONS ---');
console.log(runSql("SELECT id, user_id, title, type, is_read, created_at FROM notifications ORDER BY id DESC LIMIT 15;"));

console.log('\n--- DRIVERS & WAREHOUSE MANAGERS ---');
console.log(runSql("SELECT id, email, role, warehouse_id, full_name FROM users WHERE role NOT IN ('CUSTOMER', 'ROLE_CUSTOMER');"));
