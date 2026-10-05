\pset pager off
\pset border 2

\echo '================== 1. ALL TABLE ROW COUNTS =================='
SELECT 'users' as table_name, count(*) as count FROM users
UNION ALL SELECT 'addresses', count(*) FROM addresses
UNION ALL SELECT 'orders', count(*) FROM orders
UNION ALL SELECT 'order_items', count(*) FROM order_items
UNION ALL SELECT 'shipments', count(*) FROM shipments
UNION ALL SELECT 'shipment_tracking_events', count(*) FROM shipment_tracking_events
UNION ALL SELECT 'fulfillment_allocations', count(*) FROM fulfillment_allocations
UNION ALL SELECT 'invoices', count(*) FROM invoices
UNION ALL SELECT 'inventory_transactions', count(*) FROM inventory_transactions
UNION ALL SELECT 'drivers', count(*) FROM drivers
UNION ALL SELECT 'vehicles', count(*) FROM vehicles
UNION ALL SELECT 'warehouses', count(*) FROM warehouses;

\echo '================== 2. ALL USERS GROUPED BY ROLE =================='
SELECT id, email, full_name, role, status, company_name, phone, warehouse_id, created_at
FROM users
ORDER BY role, id;

\echo '================== 3. ALL CUSTOMER USERS AND ENTITY METRICS =================='
SELECT 
    u.id as user_id,
    u.email,
    u.full_name,
    u.company_name,
    u.role,
    COUNT(DISTINCT a.id) as address_count,
    COUNT(DISTINCT o.id) as order_count,
    COUNT(DISTINCT oi.id) as order_item_count,
    COUNT(DISTINCT s.id) as shipment_count,
    COUNT(DISTINCT ste.id) as tracking_event_count,
    COUNT(DISTINCT fa.id) as fulfillment_alloc_count,
    COUNT(DISTINCT inv.id) as invoice_count,
    COUNT(DISTINCT itx.id) as inventory_tx_count
FROM users u
LEFT JOIN addresses a ON a.customer_id = u.id
LEFT JOIN orders o ON o.customer_id = u.id
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN shipments s ON s.order_id = o.id
LEFT JOIN shipment_tracking_events ste ON ste.shipment_id = s.id
LEFT JOIN fulfillment_allocations fa ON fa.order_id = o.id
LEFT JOIN invoices inv ON inv.order_id = o.id
LEFT JOIN inventory_transactions itx ON itx.reference_order_id = o.id
GROUP BY u.id, u.email, u.full_name, u.company_name, u.role
ORDER BY u.role, u.id;

\echo '================== 4. ALL ORDERS BREAKDOWN BY CUSTOMER =================='
SELECT 
    u.id as customer_id,
    u.email as customer_email,
    u.full_name as customer_name,
    o.id as order_id,
    o.order_number,
    o.status as order_status,
    o.origin_warehouse_id,
    o.delivery_type,
    o.total_amount,
    o.created_at
FROM orders o
LEFT JOIN users u ON o.customer_id = u.id
ORDER BY u.id, o.id;

\echo '================== 5. ALL SHIPMENTS BREAKDOWN BY CUSTOMER & DRIVER/VEHICLE =================='
SELECT 
    u.email as customer_email,
    u.full_name as customer_name,
    s.id as shipment_id,
    s.tracking_number,
    s.status as shipment_status,
    s.operational_stage,
    s.origin_warehouse_id,
    s.driver_id,
    d.full_name as driver_name,
    s.vehicle_id,
    v.vehicle_number
FROM shipments s
LEFT JOIN orders o ON s.order_id = o.id
LEFT JOIN users u ON o.customer_id = u.id
LEFT JOIN drivers d ON s.driver_id = d.id
LEFT JOIN vehicles v ON s.vehicle_id = v.id
ORDER BY u.id, s.id;

\echo '================== 6. DRIVERS & VEHICLES =================='
SELECT d.id as driver_id, d.full_name, d.email, d.status as driver_status, d.warehouse_id,
       v.id as vehicle_id, v.vehicle_number, v.status as vehicle_status
FROM drivers d
LEFT JOIN vehicles v ON v.driver_id = d.id
ORDER BY d.id;

\echo '================== 7. WAREHOUSES & MANAGERS =================='
SELECT w.id, w.warehouse_code, w.warehouse_name, w.city, w.status, count(u.id) as manager_count
FROM warehouses w
LEFT JOIN users u ON u.warehouse_id = w.id
GROUP BY w.id, w.warehouse_code, w.warehouse_name, w.city, w.status
ORDER BY w.id;
