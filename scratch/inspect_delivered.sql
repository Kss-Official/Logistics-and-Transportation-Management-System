SELECT s.id, s.tracking_number, s.status AS ship_status, s.operational_stage, s.origin_warehouse_id, s.destination_warehouse_id, o.id AS order_id, o.order_number, o.status AS order_status
FROM shipments s
LEFT JOIN orders o ON s.order_id = o.id
WHERE s.status IN ('DELIVERED', 'CANCELLED')
ORDER BY s.id;
