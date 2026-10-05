const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432 -X';

function query(sql) {
  const cleanSql = sql.replace(/\r?\n/g, ' ').replace(/"/g, '\\"');
  const cmd = `${PSQL} -c "${cleanSql}"`;
  return execSync(cmd, { encoding: 'utf8', env: process.env });
}

const userIds = '(23, 25, 26, 27, 28, 29, 30, 32)';

console.log("=== ORDERS BY USERS ===");
console.log(query(`SELECT id, order_number, customer_id FROM orders WHERE customer_id IN ${userIds};`));

console.log("=== INVOICES BY USERS ===");
console.log(query(`SELECT id, invoice_number, customer_id FROM invoices WHERE customer_id IN ${userIds};`));

console.log("=== SUPPORT TICKETS BY USERS ===");
console.log(query(`SELECT id, ticket_number, customer_id FROM support_tickets WHERE customer_id IN ${userIds};`));

console.log("=== SUPPORT TICKET MESSAGES BY USERS ===");
console.log(query(`SELECT id, ticket_id, sender_id FROM support_ticket_messages WHERE sender_id IN ${userIds};`));

console.log("=== NOTIFICATIONS BY USERS ===");
console.log(query(`SELECT id, user_id, title FROM notifications WHERE user_id IN ${userIds};`));

console.log("=== ADDRESSES BY USERS ===");
console.log(query(`SELECT id, customer_id FROM addresses WHERE customer_id IN ${userIds};`));
