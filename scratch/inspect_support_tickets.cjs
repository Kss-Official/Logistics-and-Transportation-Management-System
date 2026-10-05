const { execFileSync } = require('child_process');

const psqlPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe';
const env = { ...process.env, PGPASSWORD: 'postgres123' };

function psql(query) {
  try {
    return execFileSync(psqlPath, ['-U', 'postgres', '-d', 'primeroute_db', '-c', query], { env, encoding: 'utf8' });
  } catch (err) {
    return `[ERROR: ${err.message}]`;
  }
}

console.log(psql('\\d support_tickets'));
console.log(psql('SELECT * FROM support_tickets;'));
