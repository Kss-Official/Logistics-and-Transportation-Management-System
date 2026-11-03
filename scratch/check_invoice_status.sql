SELECT id, order_number, status, payment_status, payment_method, total_amount 
FROM orders 
WHERE order_number LIKE '%17902717%';

SELECT id, invoice_number, order_id, payment_status, invoice_status, amount_paid, balance_due, payment_method 
FROM invoices 
WHERE invoice_number LIKE '%17902717%' OR order_id IN (SELECT id FROM orders WHERE order_number LIKE '%17902717%');

SELECT o.id, o.order_number, o.status, o.payment_status as ord_pstatus, o.payment_method, 
       i.id as inv_id, i.invoice_number, i.payment_status as inv_pstatus, i.invoice_status as inv_status, i.amount_paid, i.balance_due
FROM orders o
LEFT JOIN invoices i ON i.order_id = o.id
WHERE o.status = 'DELIVERED';
