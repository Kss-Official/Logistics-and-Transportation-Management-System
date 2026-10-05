\echo '==================== 1. TABLE RECORD COUNTS ===================='
SELECT 'users' as table_name, count(*) as count FROM users
UNION ALL SELECT 'customers', count(*) FROM customers
UNION ALL SELECT 'addresses', count(*) FROM addresses
UNION ALL SELECT 'orders', count(*) FROM orders
UNION ALL SELECT 'order_items', count(*) FROM order_items
UNION ALL SELECT 'shipments', count(*) FROM shipments
UNION ALL SELECT 'shipment_tracking_events', count(*) FROM shipment_tracking_events
UNION ALL SELECT 'fulfillment_allocations', count(*) FROM fulfillment_allocations
UNION ALL SELECT 'invoices', count(*) FROM invoices
UNION ALL SELECT 'proof_of_deliveries', count(*) FROM proof_of_deliveries
UNION ALL SELECT 'inventory_transactions', count(*) FROM inventory_transactions
UNION ALL SELECT 'warehouse_inventory', count(*) FROM warehouse_inventory
UNION ALL SELECT 'support_tickets', count(*) FROM support_tickets
UNION ALL SELECT 'notifications', count(*) FROM notifications
UNION ALL SELECT 'drivers', count(*) FROM drivers
UNION ALL SELECT 'vehicles', count(*) FROM vehicles
UNION ALL SELECT 'warehouses', count(*) FROM warehouses
UNION ALL SELECT 'routes', count(*) FROM routes
UNION ALL SELECT 'products', count(*) FROM products;

\echo '==================== 2. ALL USERS ===================='
SELECT id, email, full_name, role, status, warehouse_id, created_at FROM users ORDER BY id;

\echo '==================== 3. ALL CUSTOMERS ===================='
SELECT id, user_id, full_name, email, phone, company_name, gst_number, status, created_at FROM customers ORDER BY id;

\echo '==================== 4. ALL ORDERS WITH CUSTOMER INFO ===================='
SELECT o.id, o.order_number, o.customer_id, c.full_name as cust_name, c.email as cust_email, o.status, o.total_amount, o.payment_method, o.payment_status, o.created_at
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
ORDER BY o.id;

\echo '==================== 5. ALL SHIPMENTS ===================='
SELECT s.id, s.tracking_number, s.order_id, s.status, s.operational_stage, s.driver_id, d.full_name as driver_name, s.vehicle_id, s.origin_warehouse_id, s.destination_warehouse_id, s.created_at
FROM shipments s
LEFT JOIN drivers d ON s.driver_id = d.id
ORDER BY s.id;

\echo '==================== 6. ALL INVOICES ===================='
SELECT i.id, i.invoice_number, i.order_id, i.customer_id, i.total_amount, i.payment_method, i.payment_status, i.invoice_status, i.created_at
FROM invoices i
ORDER BY i.id;

\echo '==================== 7. ALL PROOF OF DELIVERIES ===================='
SELECT id, shipment_id, recipient_name, received_by, delivered_at, created_at FROM proof_of_deliveries ORDER BY id;

\echo '==================== 8. ALL SUPPORT TICKETS ===================='
SELECT id, ticket_number, customer_id, customer_name, customer_email, category, priority, status, created_at FROM support_tickets ORDER BY id;

\echo '==================== 9. ALL NOTIFICATIONS ===================='
SELECT id, user_id, title, type, is_read, created_at FROM notifications ORDER BY id;

\echo '==================== 10. DRIVERS & ASSIGNED VEHICLES ===================='
SELECT d.id as driver_id, d.full_name, d.email, d.status, d.warehouse_id, v.id as vehicle_id, v.vehicle_number, v.vehicle_type
FROM drivers d
LEFT JOIN vehicles v ON v.assigned_driver_id = d.id
ORDER BY d.id;

\echo '==================== 11. INVENTORY TRANSACTIONS ===================='
SELECT id, inventory_id, order_id, shipment_id, transaction_type, quantity, reference_number, created_at FROM inventory_transactions ORDER BY id;
