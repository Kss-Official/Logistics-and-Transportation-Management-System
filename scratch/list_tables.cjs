const { execSync } = require('child_process');

try {
  const output = execSync('"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -c "\\dt"', {
    env: { ...process.env, PGPASSWORD: 'postgres123' },
    encoding: 'utf8'
  });
  console.log('Database tables:\n', output);
} catch (e) {
  console.error('Error running psql:', e.message);
}
