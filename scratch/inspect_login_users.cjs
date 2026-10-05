const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';
try {
  const res = execSync(`${PSQL} -c "SELECT * FROM users ORDER BY id ASC;"`, {
    encoding: 'utf8',
    env: process.env
  });
  console.log(res);
} catch (err) {
  console.error(err.message);
  if (err.stdout) console.log('Stdout:', err.stdout.toString());
  if (err.stderr) console.log('Stderr:', err.stderr.toString());
}
