-- Check all potential tables
SELECT 'order_items' as tbl, count(*) as count FROM order_items WHERE order_id IN (870, 871)
UNION ALL
SELECT 'shipment_tracking_events', count(*) FROM shipment_tracking_events WHERE shipment_id IN (SELECT id FROM shipments WHERE order_id IN (870, 871))
UNION ALL
SELECT 'proof_of_deliveries', count(*) FROM proof_of_deliveries WHERE shipment_id IN (SELECT id FROM shipments WHERE order_id IN (870, 871))
UNION ALL
SELECT 'shipments', count(*) FROM shipments WHERE order_id IN (870, 871)
UNION ALL
SELECT 'fulfillment_allocations', count(*) FROM fulfillment_allocations WHERE order_id IN (870, 871)
UNION ALL
SELECT 'invoices', count(*) FROM invoices WHERE order_id IN (870, 871)
UNION ALL
SELECT 'inventory_transactions', count(*) FROM inventory_transactions WHERE reference_order IN ('PR-ORD-29842877', 'PR-ORD-74855865', '870', '871')
UNION ALL
SELECT 'notifications', count(*) FROM notifications WHERE message LIKE '%PR-ORD-29842877%' OR message LIKE '%PR-ORD-74855865%'
UNION ALL
SELECT 'orders', count(*) FROM orders WHERE id IN (870, 871);
