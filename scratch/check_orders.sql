SELECT 
    o.id,
    o.order_number,
    o.customer_id,
    u.email,
    u.full_name,
    o.created_at,
    o.status
FROM orders o
LEFT JOIN users u ON u.id = o.customer_id
WHERE o.order_number IN ('PR-ORD-13928278', 'PR-ORD-13076290', 'PR-ORD-13059718')
ORDER BY o.id;
