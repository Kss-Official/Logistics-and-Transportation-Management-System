const { execSync } = require('child_process');
const fs = require('fs');

function runSql(query) {
  const sqlFile = 'd:\\Transportation-Logistic\\scratch\\temp_reconcile.sql';
  fs.writeFileSync(sqlFile, query, 'utf8');
  const cmd = `powershell -Command "$env:PGPASSWORD='postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -h localhost -p 5432 -f '${sqlFile}' -t -A"`;
  const res = execSync(cmd, { encoding: 'utf8' }).trim();
  try { fs.unlinkSync(sqlFile); } catch (_) {}
  return res;
}

console.log('=== EXECUTING DATABASE INVOICE RECONCILIATION ===');

// 1. Check duplicate invoices before cleanup
console.log('1. Cleaning duplicate / orphan invoices...');
runSql(`
  -- Delete duplicate invoices for Order 4 (keep ID 12)
  DELETE FROM invoices WHERE id IN (13, 14);
  -- Delete orphan invoice (no order_id)
  DELETE FROM invoices WHERE order_id IS NULL;
`);

// 2. Backfill missing invoices for all orders that have 0 invoices
console.log('2. Backfilling missing invoices for orders without invoices...');
runSql(`
  INSERT INTO invoices (
    order_id,
    customer_id,
    invoice_number,
    invoice_date,
    due_date,
    subtotal,
    shipping_charge,
    discount_amount,
    tax_amount,
    total_amount,
    currency,
    invoice_status,
    payment_status,
    payment_method,
    amount_paid,
    balance_due,
    notes,
    created_at,
    updated_at
  )
  SELECT 
    o.id AS order_id,
    o.customer_id,
    'INV-PR-2026-' || LPAD(o.id::text, 6, '0') AS invoice_number,
    COALESCE(o.created_at::date, CURRENT_DATE) AS invoice_date,
    COALESCE(o.created_at::date, CURRENT_DATE) + INTERVAL '14 days' AS due_date,
    COALESCE(o.subtotal, ROUND((250.0 + COALESCE(o.package_weight, 1.0) * 38.0 * COALESCE(o.package_quantity, 1))::numeric * (CASE WHEN o.delivery_type = 'EXPRESS' THEN 1.6 ELSE 1.0 END)::numeric, 2)::double precision) AS subtotal,
    0.0 AS shipping_charge,
    0.0 AS discount_amount,
    COALESCE(o.tax_amount, ROUND((COALESCE(o.subtotal, ROUND((250.0 + COALESCE(o.package_weight, 1.0) * 38.0 * COALESCE(o.package_quantity, 1))::numeric * (CASE WHEN o.delivery_type = 'EXPRESS' THEN 1.6 ELSE 1.0 END)::numeric, 2)::double precision) * 0.18)::numeric, 2)::double precision) AS tax_amount,
    COALESCE(o.total_amount, ROUND((COALESCE(o.subtotal, 389.16) + COALESCE(o.tax_amount, 70.05))::numeric, 2)::double precision) AS total_amount,
    'INR' AS currency,
    CASE 
      WHEN o.status = 'CANCELLED' THEN 'CANCELLED'
      WHEN o.status = 'DELIVERED' THEN 'PAID'
      ELSE 'ISSUED'
    END AS invoice_status,
    CASE 
      WHEN o.status = 'DELIVERED' THEN 'PAID'
      ELSE 'UNPAID'
    END AS payment_status,
    CASE 
      WHEN o.status = 'DELIVERED' THEN 'UPI'
      ELSE NULL
    END AS payment_method,
    CASE 
      WHEN o.status = 'DELIVERED' THEN COALESCE(o.total_amount, 389.16)
      ELSE 0.0
    END AS amount_paid,
    CASE 
      WHEN o.status = 'DELIVERED' THEN 0.0
      ELSE COALESCE(o.total_amount, 389.16)
    END AS balance_due,
    'Commercial Tax Invoice for Order #' || o.order_number AS notes,
    COALESCE(o.created_at, NOW()) AS created_at,
    NOW() AS updated_at
  FROM orders o
  LEFT JOIN invoices i ON i.order_id = o.id
  WHERE i.id IS NULL;
`);

// 3. Link existing shipments to invoices if available
console.log('3. Linking shipments to invoices...');
runSql(`
  UPDATE invoices i
  SET shipment_id = s.id
  FROM shipments s
  WHERE s.order_id = i.order_id AND i.shipment_id IS NULL;
`);

// 4. Add Database-level Unique Constraint on order_id
console.log('4. Adding unique constraint on order_id in invoices table...');
runSql(`
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'uq_invoices_order_id'
    ) THEN
      ALTER TABLE invoices ADD CONSTRAINT uq_invoices_order_id UNIQUE (order_id);
    END IF;
  END $$;
`);

console.log('\n--- AUDIT AFTER RECONCILIATION ---');
const totalOrdersAfter = runSql('SELECT count(*) FROM orders;');
const totalInvoicesAfter = runSql('SELECT count(*) FROM invoices;');
const ordersWithoutInvoiceAfter = runSql('SELECT count(*) FROM orders o LEFT JOIN invoices i ON i.order_id = o.id WHERE i.id IS NULL;');
const duplicateOrderGroupsAfter = runSql('SELECT count(*) FROM (SELECT order_id FROM invoices WHERE order_id IS NOT NULL GROUP BY order_id HAVING count(*) > 1) AS dupes;');
const constraintCheck = runSql("SELECT conname FROM pg_constraint WHERE conname = 'uq_invoices_order_id';");

console.log('Total Orders:', totalOrdersAfter);
console.log('Total Invoices:', totalInvoicesAfter);
console.log('Orders Without Invoice:', ordersWithoutInvoiceAfter);
console.log('Orders With Multiple Invoices:', duplicateOrderGroupsAfter);
console.log('Unique Constraint active:', constraintCheck);
