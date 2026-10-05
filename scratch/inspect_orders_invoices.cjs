const { execSync } = require('child_process');

try {
  const psqlCmd = `powershell -Command "$env:PGPASSWORD = 'postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -c \\"SELECT id, order_number, payment_method, payment_status, status, total_amount FROM orders ORDER BY id DESC LIMIT 10;\\""`;
  const orders = execSync(psqlCmd, { encoding: 'utf8' });
  console.log('--- RECENT ORDERS ---');
  console.log(orders);

  const invCmd = `powershell -Command "$env:PGPASSWORD = 'postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -c \\"SELECT id, invoice_number, order_id, payment_method, payment_status, invoice_status, amount_paid, balance_due, total_amount FROM invoices ORDER BY id DESC LIMIT 10;\\""`;
  const invoices = execSync(invCmd, { encoding: 'utf8' });
  console.log('--- RECENT INVOICES ---');
  console.log(invoices);
} catch (err) {
  console.error(err);
}
