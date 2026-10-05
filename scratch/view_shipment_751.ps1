$env:PGPASSWORD='postgres123'
$psql = 'C:\Program Files\PostgreSQL\18\bin\psql.exe'

& $psql -U postgres -d primeroute_db -h localhost -x -c "
SELECT 
    s.id as shipment_id,
    s.tracking_number,
    s.status as shipment_status,
    s.operational_stage,
    s.assignment_status,
    s.assigned_by,
    s.assigned_at,
    s.driver_id,
    d.full_name as driver_name,
    d.email as driver_email,
    s.vehicle_id,
    v.vehicle_number,
    v.model as vehicle_model,
    s.order_id,
    o.order_number,
    o.customer_id,
    u.full_name as customer_name,
    u.email as customer_email,
    p.id as pod_id,
    p.delivered_at,
    p.recipient_name
FROM shipments s
LEFT JOIN orders o ON s.order_id = o.id
LEFT JOIN users u ON o.customer_id = u.id
LEFT JOIN drivers d ON s.driver_id = d.id
LEFT JOIN vehicles v ON s.vehicle_id = v.id
LEFT JOIN proof_of_deliveries p ON p.shipment_id = s.id
WHERE s.tracking_number = 'PR-TRK-KZ3GJJ6X';
"
