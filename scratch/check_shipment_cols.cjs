const { execSync } = require('child_process');
const psqlPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe';

function query(sql) {
  try {
    return execSync(`"${psqlPath}" -U postgres -d primeroute_db -c "${sql}"`, {
      env: { ...process.env, PGPASSWORD: 'postgres123' },
      encoding: 'utf8'
    });
  } catch (err) {
    return 'Error: ' + err.message + '\n' + (err.stderr ? err.stderr.toString() : '');
  }
}

console.log(query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'shipments';"));
