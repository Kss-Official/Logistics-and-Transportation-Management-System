const { execSync } = require('child_process');
const fs = require('fs');

function runSql(query) {
  const sqlFile = 'd:\\Transportation-Logistic\\scratch\\temp_query.sql';
  fs.writeFileSync(sqlFile, query, 'utf8');
  const cmd = `powershell -Command "$env:PGPASSWORD='postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -h localhost -p 5432 -f '${sqlFile}' -t -A"`;
  const res = execSync(cmd, { encoding: 'utf8' }).trim();
  try { fs.unlinkSync(sqlFile); } catch (_) {}
  return res;
}

console.log('--- AUDIT BEFORE RECONCILIATION ---');
const totalOrders = runSql('SELECT count(*) FROM orders;');
const totalInvoices = runSql('SELECT count(*) FROM invoices;');
const ordersWithoutInvoice = runSql('SELECT count(*) FROM orders o LEFT JOIN invoices i ON i.order_id = o.id WHERE i.id IS NULL;');
const duplicateOrderGroups = runSql('SELECT count(*) FROM (SELECT order_id FROM invoices WHERE order_id IS NOT NULL GROUP BY order_id HAVING count(*) > 1) AS dupes;');

console.log('A. Total Orders before reconciliation:', totalOrders);
console.log('B. Orders without invoices before reconciliation:', ordersWithoutInvoice);
console.log('C. Duplicate invoice groups before reconciliation:', duplicateOrderGroups);
console.log('D. Total Invoices before reconciliation:', totalInvoices);
