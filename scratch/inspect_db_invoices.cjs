const fs = require('fs');
const { execSync } = require('child_process');

function runSql(query) {
  const singleLine = query.replace(/\r?\n/g, ' ');
  const cmd = `powershell -Command "$env:PGPASSWORD='postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -h localhost -p 5432 -c \\"${singleLine}\\""`;
  return execSync(cmd, { encoding: 'utf8' });
}

console.log('=== DATABASE INVOICE & ORDER SCHEMA INSPECTION ===');
console.log('--- Invoices Columns ---');
console.log(runSql(`
  SELECT column_name, data_type, is_nullable 
  FROM information_schema.columns 
  WHERE table_name = 'invoices' 
  ORDER BY ordinal_position;
`));

console.log('--- Invoices Constraints ---');
console.log(runSql(`
  SELECT conname, pg_get_constraintdef(c.oid)
  FROM pg_constraint c
  JOIN pg_namespace n ON n.oid = c.connamespace
  WHERE conrelid = 'invoices'::regclass;
`));

console.log('--- Orders vs Invoices Counts ---');
console.log(runSql(`SELECT count(*) AS total_orders FROM orders;`));
console.log(runSql(`SELECT count(*) AS total_invoices FROM invoices;`));
console.log(runSql(`
  SELECT count(*) AS orders_without_invoice 
  FROM orders o 
  LEFT JOIN invoices i ON i.order_id = o.id 
  WHERE i.id IS NULL;
`));
console.log(runSql(`
  SELECT o.id, o.order_number, count(i.id) AS invoice_count
  FROM orders o
  JOIN invoices i ON i.order_id = o.id
  GROUP BY o.id, o.order_number
  HAVING count(i.id) > 1;
`));
console.log(runSql(`
  SELECT i.id, i.invoice_number, i.order_id, i.customer_id, i.total_amount, i.status, i.created_at
  FROM invoices i
  LIMIT 10;
`));
