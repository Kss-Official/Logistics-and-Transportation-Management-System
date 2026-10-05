const fs = require('fs');
const { execSync } = require('child_process');

const psqlCmd = `"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -c`;

console.log('=== Step 1: Check Inconsistent Orders and Invoices before reconciliation ===');
const beforeCheck = execSync(`${psqlCmd} "SELECT o.id, o.order_number, o.payment_method, o.payment_status, o.total_amount, i.id as invoice_id, i.invoice_number, i.invoice_status, i.payment_status as inv_payment_status, i.amount_paid, i.balance_due FROM orders o LEFT JOIN invoices i ON i.order_id = o.id WHERE o.payment_method != 'COD' ORDER BY o.id DESC;"`, {
  env: { ...process.env, PGPASSWORD: 'postgres123' }
}).toString();
console.log(beforeCheck);

console.log('=== Step 2: Reconcile Online Paid Orders & Invoices ===');
const reconcileSql = `
-- 1. For orders placed with online payment methods (CARD, UPI, NET_BANKING, BANK_TRANSFER, CREDIT), set order payment_status = PAID
UPDATE orders 
SET payment_status = 'PAID', updated_at = NOW()
WHERE payment_method IN ('CARD', 'UPI', 'NET_BANKING', 'BANK_TRANSFER', 'CREDIT')
  AND payment_status != 'PAID';

-- 2. Synchronize associated invoices for these orders
UPDATE invoices i
SET 
  payment_status = 'PAID',
  invoice_status = 'PAID',
  amount_paid = i.total_amount,
  balance_due = 0.0,
  payment_date = COALESCE(i.payment_date, o.created_at::date, CURRENT_DATE),
  updated_at = NOW()
FROM orders o
WHERE i.order_id = o.id
  AND o.payment_status = 'PAID'
  AND (i.payment_status != 'PAID' OR i.balance_due != 0.0 OR i.amount_paid != i.total_amount);

-- 3. Ensure COD orders remain UNPAID / PENDING with 0 amount paid and full balance due
UPDATE invoices i
SET 
  payment_status = 'UNPAID',
  invoice_status = 'ISSUED',
  amount_paid = 0.0,
  balance_due = i.total_amount,
  updated_at = NOW()
FROM orders o
WHERE i.order_id = o.id
  AND o.payment_method = 'COD'
  AND o.status != 'CANCELLED'
  AND o.payment_status = 'UNPAID'
  AND i.amount_paid > 0;
`;

const updateResult = execSync(`${psqlCmd} "${reconcileSql.replace(/\r?\n/g, ' ')}"`, {
  env: { ...process.env, PGPASSWORD: 'postgres123' }
}).toString();
console.log(updateResult);

console.log('=== Step 3: Check Specific Record PR-ORD-10001907 and all recent invoices after reconciliation ===');
const afterCheck = execSync(`${psqlCmd} "SELECT o.id, o.order_number, o.payment_method, o.payment_status, o.total_amount, i.id as invoice_id, i.invoice_number, i.invoice_status, i.payment_status as inv_payment_status, i.amount_paid, i.balance_due, i.payment_date FROM orders o LEFT JOIN invoices i ON i.order_id = o.id WHERE o.order_number = 'PR-ORD-10001907';"`, {
  env: { ...process.env, PGPASSWORD: 'postgres123' }
}).toString();
console.log(afterCheck);

const allInvoicesCheck = execSync(`${psqlCmd} "SELECT o.order_number, o.payment_method, o.payment_status as ord_payment_status, i.invoice_number, i.invoice_status, i.payment_status as inv_payment_status, i.total_amount, i.amount_paid, i.balance_due, i.payment_date FROM orders o LEFT JOIN invoices i ON i.order_id = o.id ORDER BY o.id DESC LIMIT 12;"`, {
  env: { ...process.env, PGPASSWORD: 'postgres123' }
}).toString();
console.log(allInvoicesCheck);
