\x
-- Verify target orders not found
SELECT * FROM orders WHERE order_number IN ('PR-ORD-29842877', 'PR-ORD-74855865');

-- Verify target invoices not found
SELECT * FROM invoices WHERE invoice_number IN ('INV-PR-ORD-29842877', 'INV-PR-ORD-74855865') OR order_id IN (870, 871);

-- Verify target fulfillment allocations not found
SELECT * FROM fulfillment_allocations WHERE order_id IN (870, 871);

-- Verify target order items not found
SELECT * FROM order_items WHERE order_id IN (870, 871);

-- Verify target shipments not found
SELECT * FROM shipments WHERE order_id IN (870, 871);

-- List all remaining orders (order_number, customer_id, status, total_amount)
\x off
SELECT id, order_number, customer_id, status, total_amount, payment_status, created_at 
FROM orders 
ORDER BY id DESC;

-- List all remaining invoices (invoice_number, order_id, total_amount, payment_status)
SELECT id, invoice_number, order_id, total_amount, payment_status, invoice_status 
FROM invoices 
ORDER BY id DESC;
