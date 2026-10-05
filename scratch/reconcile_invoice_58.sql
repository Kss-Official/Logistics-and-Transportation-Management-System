UPDATE invoices 
SET 
    payment_status = 'UNPAID',
    invoice_status = 'ISSUED',
    amount_paid = 0.0,
    balance_due = total_amount,
    payment_date = NULL,
    transaction_id = NULL
WHERE id = 58;

SELECT id, invoice_number, order_id, invoice_status, payment_status, payment_method, total_amount, amount_paid, balance_due 
FROM invoices 
WHERE id = 58;
