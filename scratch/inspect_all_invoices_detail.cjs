const { execSync } = require('child_process');

function runSql(query) {
  const singleLine = query.replace(/\r?\n/g, ' ');
  const cmd = `powershell -Command "$env:PGPASSWORD='postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -h localhost -p 5432 -c \\"${singleLine}\\""`;
  return execSync(cmd, { encoding: 'utf8' });
}

console.log('=== ALL EXISTING INVOICES ===');
console.log(runSql('SELECT id, invoice_number, order_id, shipment_id, customer_id, subtotal, tax_amount, total_amount, invoice_status, payment_status, created_at FROM invoices ORDER BY id;'));

console.log('=== ORDERS WITH INVOICE COUNTS ===');
console.log(runSql('SELECT o.id, o.order_number, o.status, o.total_amount, count(i.id) AS inv_count FROM orders o LEFT JOIN invoices i ON i.order_id = o.id GROUP BY o.id, o.order_number, o.status, o.total_amount ORDER BY o.id;'));
