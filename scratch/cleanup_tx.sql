
BEGIN;

-- 1. Delete Proof of Deliveries for demo shipments
DELETE FROM proof_of_deliveries
WHERE shipment_id NOT IN (
  SELECT s.id FROM shipments s
  JOIN orders o ON s.order_id = o.id
  WHERE o.order_number IN ('PR-ORD-77062649', 'PR-ORD-76406402', 'PR-ORD-30750634', 'PR-ORD-27539459', 'PR-ORD-60638742')
);

-- 2. Delete Shipment Tracking Events for demo shipments
DELETE FROM shipment_tracking_events
WHERE shipment_id NOT IN (
  SELECT s.id FROM shipments s
  JOIN orders o ON s.order_id = o.id
  WHERE o.order_number IN ('PR-ORD-77062649', 'PR-ORD-76406402', 'PR-ORD-30750634', 'PR-ORD-27539459', 'PR-ORD-60638742')
);

-- 3. Delete Inventory Transactions for demo orders/shipments
DELETE FROM inventory_transactions
WHERE reference_order IS NOT NULL 
  AND reference_order != ''
  AND reference_order NOT IN ('PR-ORD-77062649', 'PR-ORD-76406402', 'PR-ORD-30750634', 'PR-ORD-27539459', 'PR-ORD-60638742');

DELETE FROM inventory_transactions
WHERE reference_shipment IS NOT NULL
  AND reference_shipment != ''
  AND reference_shipment NOT IN (
    SELECT s.tracking_number FROM shipments s
    JOIN orders o ON s.order_id = o.id
    WHERE o.order_number IN ('PR-ORD-77062649', 'PR-ORD-76406402', 'PR-ORD-30750634', 'PR-ORD-27539459', 'PR-ORD-60638742')
  );

-- 4. Delete Support Ticket Messages and Support Tickets for demo users/automated tests
DELETE FROM support_ticket_messages
WHERE ticket_id IN (
  SELECT t.id FROM support_tickets t
  JOIN users u ON t.customer_id = u.id
  WHERE u.email NOT IN ('sanjanaaa.shru@gmail.com', 'admin@primeroute.com', 'priya@primeroute.com', 'ccu.east@primeroute.com', 'ramesh@primeroute.com', 'priya.patel@primeroute.in', 'sneha.kulkarni@primeroute.in', 'anil.deshmukh.1790082100291@primeroute.com', 'arjun.das@primeroute.in', 'shrutisanjanasahoo@gmail.com', 'manoj3@gmail.com', 'gudi78@gmail.com', 'routjig09@gmail.com', 'kousik12@gmail.com')
     OR t.ticket_number IN ('TCK-452949', 'PR-TKT-40196765', 'PR-TKT-95343383', 'PR-TKT-46875287', 'PR-TKT-59931034', 'PR-TKT-40960288', 'PR-TKT-88567614')
);

DELETE FROM support_tickets
WHERE customer_id NOT IN (SELECT id FROM users WHERE email IN ('sanjanaaa.shru@gmail.com', 'admin@primeroute.com', 'priya@primeroute.com', 'ccu.east@primeroute.com', 'ramesh@primeroute.com', 'priya.patel@primeroute.in', 'sneha.kulkarni@primeroute.in', 'anil.deshmukh.1790082100291@primeroute.com', 'arjun.das@primeroute.in', 'shrutisanjanasahoo@gmail.com', 'manoj3@gmail.com', 'gudi78@gmail.com', 'routjig09@gmail.com', 'kousik12@gmail.com'))
   OR ticket_number IN ('TCK-452949', 'PR-TKT-40196765', 'PR-TKT-95343383', 'PR-TKT-46875287', 'PR-TKT-59931034', 'PR-TKT-40960288', 'PR-TKT-88567614');

-- 5. Delete Notifications for demo users or referencing deleted entities
DELETE FROM notifications
WHERE user_id NOT IN (SELECT id FROM users WHERE email IN ('sanjanaaa.shru@gmail.com', 'admin@primeroute.com', 'priya@primeroute.com', 'ccu.east@primeroute.com', 'ramesh@primeroute.com', 'priya.patel@primeroute.in', 'sneha.kulkarni@primeroute.in', 'anil.deshmukh.1790082100291@primeroute.com', 'arjun.das@primeroute.in', 'shrutisanjanasahoo@gmail.com', 'manoj3@gmail.com', 'gudi78@gmail.com', 'routjig09@gmail.com', 'kousik12@gmail.com'))
   OR message LIKE '%PR-ORD-%' AND NOT (
      message LIKE '%PR-ORD-77062649%' OR 
      message LIKE '%PR-ORD-76406402%' OR 
      message LIKE '%PR-ORD-30750634%' OR 
      message LIKE '%PR-ORD-27539459%' OR 
      message LIKE '%PR-ORD-60638742%'
   );

-- 6. Delete Invoices for demo orders (MUST be before shipments and orders)
DELETE FROM invoices
WHERE order_id NOT IN (
  SELECT id FROM orders WHERE order_number IN ('PR-ORD-77062649', 'PR-ORD-76406402', 'PR-ORD-30750634', 'PR-ORD-27539459', 'PR-ORD-60638742')
) OR order_id IS NULL;

-- 7. Delete Shipments for demo orders (MUST be before orders)
DELETE FROM shipments
WHERE order_id NOT IN (
  SELECT id FROM orders WHERE order_number IN ('PR-ORD-77062649', 'PR-ORD-76406402', 'PR-ORD-30750634', 'PR-ORD-27539459', 'PR-ORD-60638742')
) OR order_id IS NULL;

-- 8. Delete Fulfillment Allocations for demo orders
DELETE FROM fulfillment_allocations
WHERE order_id NOT IN (
  SELECT id FROM orders WHERE order_number IN ('PR-ORD-77062649', 'PR-ORD-76406402', 'PR-ORD-30750634', 'PR-ORD-27539459', 'PR-ORD-60638742')
);

-- 9. Delete Order Items for demo orders
DELETE FROM order_items
WHERE order_id NOT IN (
  SELECT id FROM orders WHERE order_number IN ('PR-ORD-77062649', 'PR-ORD-76406402', 'PR-ORD-30750634', 'PR-ORD-27539459', 'PR-ORD-60638742')
);

-- 10. Delete Orders for demo customers / test batches
DELETE FROM orders
WHERE order_number NOT IN ('PR-ORD-77062649', 'PR-ORD-76406402', 'PR-ORD-30750634', 'PR-ORD-27539459', 'PR-ORD-60638742');

-- 11. Delete Addresses for demo users (Only after orders referencing them are deleted)
DELETE FROM addresses
WHERE customer_id NOT IN (SELECT id FROM users WHERE email IN ('sanjanaaa.shru@gmail.com', 'admin@primeroute.com', 'priya@primeroute.com', 'ccu.east@primeroute.com', 'ramesh@primeroute.com', 'priya.patel@primeroute.in', 'sneha.kulkarni@primeroute.in', 'anil.deshmukh.1790082100291@primeroute.com', 'arjun.das@primeroute.in', 'shrutisanjanasahoo@gmail.com', 'manoj3@gmail.com', 'gudi78@gmail.com', 'routjig09@gmail.com', 'kousik12@gmail.com'));

-- 12. Delete Password Reset Tokens for demo users
DELETE FROM password_reset_tokens
WHERE user_id NOT IN (SELECT id FROM users WHERE email IN ('sanjanaaa.shru@gmail.com', 'admin@primeroute.com', 'priya@primeroute.com', 'ccu.east@primeroute.com', 'ramesh@primeroute.com', 'priya.patel@primeroute.in', 'sneha.kulkarni@primeroute.in', 'anil.deshmukh.1790082100291@primeroute.com', 'arjun.das@primeroute.in', 'shrutisanjanasahoo@gmail.com', 'manoj3@gmail.com', 'gudi78@gmail.com', 'routjig09@gmail.com', 'kousik12@gmail.com'));

-- 13. Delete Demo Users
DELETE FROM users
WHERE email NOT IN ('sanjanaaa.shru@gmail.com', 'admin@primeroute.com', 'priya@primeroute.com', 'ccu.east@primeroute.com', 'ramesh@primeroute.com', 'priya.patel@primeroute.in', 'sneha.kulkarni@primeroute.in', 'anil.deshmukh.1790082100291@primeroute.com', 'arjun.das@primeroute.in', 'shrutisanjanasahoo@gmail.com', 'manoj3@gmail.com', 'gudi78@gmail.com', 'routjig09@gmail.com', 'kousik12@gmail.com');

-- 14. Reconcile Warehouse Inventories (Ensure reserved_stock only accounts for active unfulfilled retained orders: PR-MOU-001 has 2 units reserved in WH 1)
UPDATE inventories
SET reserved_stock = 0,
    available_stock = total_stock - damaged_stock;

-- Apply reservation for active unfulfilled order PR-ORD-30750634 (2 units of PR-MOU-001 in WH 1)
UPDATE inventories
SET reserved_stock = 2,
    available_stock = total_stock - 2 - damaged_stock
WHERE warehouse_id = 1 AND sku = 'PR-MOU-001';

COMMIT;
