const { execFileSync } = require('child_process');

const psqlPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe';
const env = { ...process.env, PGPASSWORD: 'postgres123' };

function psql(query) {
  return execFileSync(psqlPath, ['-U', 'postgres', '-d', 'primeroute_db', '-c', query], { env, encoding: 'utf8' });
}

console.log(psql('\\d vehicles'));
console.log(psql('SELECT * FROM vehicles ORDER BY id;'));
