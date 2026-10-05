$PSQL = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$env:PGPASSWORD = "postgres123"

$SQL_CLEANUP = @"
BEGIN;

-- 1. Delete shipment tracking events for the 9 demo shipments
DELETE FROM shipment_tracking_events 
WHERE shipment_id IN (23, 24, 26, 32, 33, 39, 40, 41, 43);

-- 2. Delete inventory transactions for the demo shipments and orders
DELETE FROM inventory_transactions 
WHERE reference_shipment IN ('PR-TRK-978XWFA4', 'PR-TRK-5HE8CLL3', 'PR-TRK-9352ES77', 'TRK-PR-Z56HH4YW', 'TRK-PR-JV685885', 'TRK-PR-BGQ7LNXH', 'TRK-PR-CR4R5P77', 'TRK-PR-H4ZVE8KN', 'TRK-PR-LBR4EJ33')
   OR reference_order IN ('PR-ORD-90152708', 'PR-ORD-91982468', 'PR-ORD-56107751', 'PR-ORD-87787000', 'PR-ORD-46348206', 'PR-ORD-77581730', 'PR-ORD-11694295', 'PR-ORD-19214882', 'PR-ORD-55161890');

-- 3. Delete the 9 demo shipments
DELETE FROM shipments 
WHERE id IN (23, 24, 26, 32, 33, 39, 40, 41, 43);

-- 4. Delete fulfillment allocations for the demo orders
DELETE FROM fulfillment_allocations 
WHERE order_id IN (23, 25, 36, 41, 42, 46, 47, 48, 50);

-- 5. Delete order items for the demo orders
DELETE FROM order_items 
WHERE order_id IN (23, 25, 36, 41, 42, 46, 47, 48, 50);

-- 6. Delete the demo orders
DELETE FROM orders 
WHERE id IN (23, 25, 36, 41, 42, 46, 47, 48, 50);

-- 7. Reconcile Driver statuses: ON_TRIP -> AVAILABLE
UPDATE drivers 
SET status = 'AVAILABLE', updated_at = NOW() 
WHERE status = 'ON_TRIP';

-- 8. Reconcile Vehicle statuses: IN_TRANSIT -> ASSIGNED
UPDATE vehicles 
SET status = 'ASSIGNED', updated_at = NOW() 
WHERE status = 'IN_TRANSIT';

COMMIT;
"@

Write-Host "Executing Driver Portal demo data cleanup..." -ForegroundColor Cyan
& $PSQL -U postgres -d primeroute_db -c $SQL_CLEANUP
