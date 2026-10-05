-- Step 1: Target Orders
SELECT o.id as order_id, o.order_number, o.customer_id, u.email as customer_email, o.status as order_status, o.total_amount, o.payment_status
FROM orders o
LEFT JOIN users u ON o.customer_id = u.id
WHERE o.order_number IN ('PR-ORD-29842877', 'PR-ORD-74855865');

-- Step 2: Order Items
SELECT oi.id as order_item_id, oi.order_id, oi.product_id, oi.quantity, oi.unit_price, oi.total_price
FROM order_items oi
WHERE oi.order_id IN (
    SELECT id FROM orders WHERE order_number IN ('PR-ORD-29842877', 'PR-ORD-74855865')
);

-- Step 3: Invoices
SELECT i.id as invoice_id, i.invoice_number, i.order_id, i.amount, i.status, i.payment_status
FROM invoices i
WHERE i.order_id IN (
    SELECT id FROM orders WHERE order_number IN ('PR-ORD-29842877', 'PR-ORD-74855865')
) OR i.order_number IN ('PR-ORD-29842877', 'PR-ORD-74855865');

-- Step 4: Shipments
SELECT s.id as shipment_id, s.tracking_number, s.order_id, s.order_number, s.status, s.driver_id, s.vehicle_id
FROM shipments s
WHERE s.order_id IN (
    SELECT id FROM orders WHERE order_number IN ('PR-ORD-29842877', 'PR-ORD-74855865')
) OR s.order_number IN ('PR-ORD-29842877', 'PR-ORD-74855865');

-- Step 5: Shipment Tracking Events
SELECT ste.id as event_id, ste.shipment_id, ste.status, ste.location, ste.event_time
FROM shipment_tracking_events ste
WHERE ste.shipment_id IN (
    SELECT id FROM shipments WHERE order_id IN (
        SELECT id FROM orders WHERE order_number IN ('PR-ORD-29842877', 'PR-ORD-74855865')
    ) OR order_number IN ('PR-ORD-29842877', 'PR-ORD-74855865')
);

-- Step 6: Fulfillment Allocations
SELECT fa.id as allocation_id, fa.order_id, fa.warehouse_id, fa.product_id, fa.quantity_allocated
FROM fulfillment_allocations fa
WHERE fa.order_id IN (
    SELECT id FROM orders WHERE order_number IN ('PR-ORD-29842877', 'PR-ORD-74855865')
);

-- Step 7: Inventory Transactions
SELECT it.id as tx_id, it.transaction_type, it.quantity, it.reference_order_id, it.reference_number, it.product_id, it.warehouse_id
FROM inventory_transactions it
WHERE it.reference_order_id IN (
    SELECT id FROM orders WHERE order_number IN ('PR-ORD-29842877', 'PR-ORD-74855865')
) OR it.reference_number IN ('PR-ORD-29842877', 'PR-ORD-74855865');

-- Step 8: Total Counts of Orders and Invoices before deletion
SELECT COUNT(*) as total_orders FROM orders;
SELECT COUNT(*) as total_invoices FROM invoices;
SELECT COUNT(*) as total_shipments FROM shipments;
