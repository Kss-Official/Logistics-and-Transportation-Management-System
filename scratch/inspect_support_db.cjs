const { execSync } = require('child_process');

process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

function query(sql) {
  try {
    return execSync(`${PSQL} -c "${sql}"`, { encoding: 'utf8', env: process.env });
  } catch (e) {
    return 'ERROR: ' + e.message;
  }
}

console.log('=== LIST ALL TABLES VIA \\dt ===');
console.log(query('\\dt'));
console.log('=== SELECT table_schema, table_name FROM information_schema.tables; ===');
console.log(query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema');"));

console.log('=== SCHEMA: support_contacts ===');
console.log(query('\\d support_contacts'));
console.log('=== DATA: support_contacts ===');
console.log(query('SELECT * FROM support_contacts;'));

console.log('=== SCHEMA: support_tickets ===');
console.log(query('\\d support_tickets'));
console.log('=== DATA: support_tickets ===');
console.log(query('SELECT * FROM support_tickets;'));

console.log('=== SCHEMA: support_ticket_messages ===');
console.log(query('\\d support_ticket_messages'));
console.log('=== DATA: support_ticket_messages ===');
console.log(query('SELECT * FROM support_ticket_messages;'));
