\pset pager off
\pset border 2

\echo '================== ALL CUSTOMERS / USERS AND THEIR EXACT ENTITY COUNTS =================='
SELECT 
    u.id as user_id,
    u.email,
    u.full_name,
    u.company_name,
    u.role,
    COUNT(DISTINCT a.id) as addresses,
    COUNT(DISTINCT o.id) as orders,
    COUNT(DISTINCT oi.id) as order_items,
    COUNT(DISTINCT s.id) as shipments,
    COUNT(DISTINCT ste.id) as tracking_events,
    COUNT(DISTINCT fa.id) as fulfillment_allocs,
    COUNT(DISTINCT inv.id) as invoices,
    COUNT(DISTINCT itx.id) as inventory_txs
FROM users u
LEFT JOIN addresses a ON a.customer_id = u.id
LEFT JOIN orders o ON o.customer_id = u.id
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN shipments s ON s.order_id = o.id
LEFT JOIN shipment_tracking_events ste ON ste.shipment_id = s.id
LEFT JOIN fulfillment_allocations fa ON fa.order_id = o.id
LEFT JOIN invoices inv ON inv.order_id = o.id
LEFT JOIN inventory_transactions itx ON itx.reference_order = o.order_number
GROUP BY u.id, u.email, u.full_name, u.company_name, u.role
ORDER BY u.id;
