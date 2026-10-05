const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432 -X';

function query(sql) {
  const cmd = `${PSQL} -c "${sql.replace(/"/g, '\\"')}"`;
  return execSync(cmd, { encoding: 'utf8', env: process.env });
}

console.log(query("SELECT current_schema(), current_database();"));
console.log(query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_type='BASE TABLE';"));
