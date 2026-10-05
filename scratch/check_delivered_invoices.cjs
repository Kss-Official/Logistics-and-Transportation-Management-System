const { execSync } = require('child_process');
const fs = require('fs');

function runSql(query) {
  const sqlFile = 'd:\\Transportation-Logistic\\scratch\\temp_check_delivered.sql';
  fs.writeFileSync(sqlFile, query, 'utf8');
  const cmd = `powershell -Command "$env:PGPASSWORD='postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -h localhost -p 5432 -f '${sqlFile}' -t -A"`;
  const res = execSync(cmd, { encoding: 'utf8' }).trim();
  try { fs.unlinkSync(sqlFile); } catch (_) {}
  return res;
}

const targetOrders = [
  'PR-ORD-49840198',
  'PR-ORD-67247594',
  'PR-ORD-96968126',
  'PR-ORD-82150412',
  'PR-ORD-54307458',
  'PR-ORD-76406402',
  'PR-ORD-77062649',
  'PR-ORD-60638742'
];

console.log('=== DELIVERED ORDERS INVOICE AUDIT ===');
for (const ord of targetOrders) {
  const q = `
    SELECT o.order_number, o.status, i.invoice_number, i.total_amount, i.invoice_status, i.payment_status
    FROM orders o
    LEFT JOIN invoices i ON i.order_id = o.id
    WHERE o.order_number = '${ord}';
  `;
  console.log(runSql(q));
}
