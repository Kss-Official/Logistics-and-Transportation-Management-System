-- PrimeRoute Logistics: Authoritative Payment & Invoice Reconciliation
BEGIN;

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

-- 3. Ensure COD orders remain UNPAID with 0 amount paid and full balance due
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

COMMIT;
