$env:PGPASSWORD = "postgres123"
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
if (-not (Test-Path $psqlPath)) { $psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe" }
if (-not (Test-Path $psqlPath)) { $psqlPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe" }

$sql = @"
\echo '=== 1. USER RECORD ==='
SELECT id, email, full_name, role, status, created_at FROM users WHERE LOWER(email) = LOWER('shrutisanjanasahoo@gmail.com');

\echo '=== 2. ORDERS BELONGING TO CUSTOMER ==='
SELECT o.id, o.order_number, o.status, o.delivery_type, o.package_description, o.package_weight, o.total_amount, o.origin_warehouse_id, o.created_at
FROM orders o
JOIN users u ON o.customer_id = u.id
WHERE LOWER(u.email) = LOWER('shrutisanjanasahoo@gmail.com')
ORDER BY o.id ASC;

\echo '=== 3. ORDER ITEMS ==='
SELECT oi.id, oi.order_id, oi.product_id, p.sku, p.name, oi.quantity, oi.unit_price, oi.total_weight
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN users u ON o.customer_id = u.id
LEFT JOIN products p ON oi.product_id = p.id
WHERE LOWER(u.email) = LOWER('shrutisanjanasahoo@gmail.com')
ORDER BY oi.id ASC;

\echo '=== 4. SHIPMENTS BELONGING TO CUSTOMER ORDERS ==='
SELECT s.id, s.tracking_number, s.order_id, o.order_number, s.status, s.operational_stage, s.assignment_status, s.driver_id, d.full_name AS driver_name, d.status AS driver_status, s.vehicle_id, v.vehicle_number, v.status AS vehicle_status, s.origin_warehouse_id, ow.warehouse_code AS origin_wh, s.destination_warehouse_id, dw.warehouse_code AS dest_wh
FROM shipments s
JOIN orders o ON s.order_id = o.id
JOIN users u ON o.customer_id = u.id
LEFT JOIN drivers d ON s.driver_id = d.id
LEFT JOIN vehicles v ON s.vehicle_id = v.id
LEFT JOIN warehouses ow ON s.origin_warehouse_id = ow.id
LEFT JOIN warehouses dw ON s.destination_warehouse_id = dw.id
WHERE LOWER(u.email) = LOWER('shrutisanjanasahoo@gmail.com')
ORDER BY s.id ASC;

\echo '=== 5. SHIPMENT TRACKING EVENTS ==='
SELECT ste.id, ste.shipment_id, s.tracking_number, ste.status, ste.title, ste.event_time
FROM shipment_tracking_events ste
JOIN shipments s ON ste.shipment_id = s.id
JOIN orders o ON s.order_id = o.id
JOIN users u ON o.customer_id = u.id
WHERE LOWER(u.email) = LOWER('shrutisanjanasahoo@gmail.com')
ORDER BY ste.id ASC;

\echo '=== 6. FULFILLMENT ALLOCATIONS ==='
SELECT fa.id, fa.order_id, o.order_number, fa.allocated_warehouse_id, w.warehouse_code, fa.allocation_type, fa.allocation_status, fa.allocated_at
FROM fulfillment_allocations fa
JOIN orders o ON fa.order_id = o.id
JOIN users u ON o.customer_id = u.id
LEFT JOIN warehouses w ON fa.allocated_warehouse_id = w.id
WHERE LOWER(u.email) = LOWER('shrutisanjanasahoo@gmail.com')
ORDER BY fa.id ASC;

\echo '=== 7. INVOICES ==='
SELECT inv.id, inv.invoice_number, inv.order_id, o.order_number, inv.customer_id, inv.status, inv.total_amount, inv.issued_date
FROM invoices inv
JOIN orders o ON inv.order_id = o.id
JOIN users u ON o.customer_id = u.id
WHERE LOWER(u.email) = LOWER('shrutisanjanasahoo@gmail.com')
ORDER BY inv.id ASC;

\echo '=== 8. INVENTORY TRANSACTIONS ==='
SELECT it.id, it.warehouse_id, w.warehouse_code, it.sku, it.product_name, it.transaction_type, it.quantity, it.previous_available, it.new_available, it.reference_order, it.reference_shipment, it.timestamp
FROM inventory_transactions it
LEFT JOIN warehouses w ON it.warehouse_id = w.id
WHERE it.reference_order IN (
    SELECT o.order_number FROM orders o JOIN users u ON o.customer_id = u.id WHERE LOWER(u.email) = LOWER('shrutisanjanasahoo@gmail.com')
)
OR it.reference_shipment IN (
    SELECT s.tracking_number FROM shipments s JOIN orders o ON s.order_id = o.id JOIN users u ON o.customer_id = u.id WHERE LOWER(u.email) = LOWER('shrutisanjanasahoo@gmail.com')
)
ORDER BY it.id ASC;

\echo '=== 9. ADDRESSES LINKED TO ORDERS ==='
SELECT DISTINCT a.id, a.user_id, a.address_line1, a.city, a.state, a.postal_code, a.country,
       EXISTS (SELECT 1 FROM orders o WHERE o.pickup_address_id = a.id OR o.delivery_address_id = a.id) AS is_order_addr
FROM addresses a
WHERE a.user_id = (SELECT id FROM users WHERE LOWER(email) = LOWER('shrutisanjanasahoo@gmail.com'))
   OR a.id IN (SELECT pickup_address_id FROM orders o JOIN users u ON o.customer_id = u.id WHERE LOWER(u.email) = LOWER('shrutisanjanasahoo@gmail.com'))
   OR a.id IN (SELECT delivery_address_id FROM orders o JOIN users u ON o.customer_id = u.id WHERE LOWER(u.email) = LOWER('shrutisanjanasahoo@gmail.com'));

\echo '=== 10. CURRENT INVENTORY RESERVATIONS & TOTALS ==='
SELECT i.id, w.warehouse_code, i.sku, i.product_name, i.total_stock, i.available_stock, i.reserved_stock, i.damaged_stock, i.status
FROM inventories i
JOIN warehouses w ON i.warehouse_id = w.id
ORDER BY w.warehouse_code, i.sku;

\echo '=== 11. OTHER CUSTOMERS ORDER SUMMARY (MUST NOT BE DELETED) ==='
SELECT u.id AS customer_id, u.email, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.customer_id = u.id
WHERE LOWER(u.email) != LOWER('shrutisanjanasahoo@gmail.com') AND u.role = 'CUSTOMER'
GROUP BY u.id, u.email;

"@

& $psqlPath -U postgres -d primeroute_db -h localhost -c $sql
