const { execSync } = require('child_process');

try {
  const psqlQuery = `
    SELECT o.id, o.order_number, o.customer_id, u.email, o.payment_method, o.payment_status, o.total_amount, i.invoice_number, i.payment_status as inv_payment_status, i.amount_paid, i.balance_due
    FROM orders o
    LEFT JOIN users u ON o.customer_id = u.id
    LEFT JOIN invoices i ON i.order_id = o.id
    WHERE o.order_number = 'PR-ORD-10001907';
  `;
  const cmd = `powershell -Command "$env:PGPASSWORD = 'postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -c \\"${psqlQuery.replace(/\n/g, ' ')}\\""`;
  const res = execSync(cmd, { encoding: 'utf8' });
  console.log('--- ORDER PR-ORD-10001907 ---');
  console.log(res);
} catch (e) {
  console.error(e);
}
