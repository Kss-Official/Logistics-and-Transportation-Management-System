-- 1. Reconcile all delivered orders to have payment_status = 'PAID'
UPDATE orders 
SET payment_status = 'PAID',
    updated_at = NOW()
WHERE status = 'DELIVERED' 
  AND (payment_status IS NULL OR payment_status != 'PAID');

-- 2. Reconcile all invoices associated with delivered orders or order PR-ORD-17902717
UPDATE invoices 
SET payment_status = 'PAID',
    invoice_status = 'PAID',
    amount_paid = total_amount,
    balance_due = 0.0,
    payment_date = COALESCE(payment_date, CURRENT_DATE),
    updated_at = NOW()
WHERE order_id IN (SELECT id FROM orders WHERE status = 'DELIVERED' OR payment_status = 'PAID')
   OR invoice_number LIKE '%17902717%';

-- 3. Verify results
SELECT o.id, o.order_number, o.status, o.payment_status as ord_pstatus, o.payment_method, 
       i.id as inv_id, i.invoice_number, i.payment_status as inv_pstatus, i.invoice_status as inv_status, i.amount_paid, i.balance_due
FROM orders o
LEFT JOIN invoices i ON i.order_id = o.id
WHERE o.status = 'DELIVERED' OR o.order_number LIKE '%17902717%';
