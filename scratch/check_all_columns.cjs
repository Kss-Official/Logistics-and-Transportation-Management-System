const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432 -X';

function query(sql) {
  const cmd = `${PSQL} -c "${sql.replace(/"/g, '\\"')}"`;
  return execSync(cmd, { encoding: 'utf8', env: process.env });
}

console.log("=== ALL TABLE COLUMNS ===");
console.log(query(`
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;
`));
