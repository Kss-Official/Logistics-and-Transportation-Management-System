$env:PGPASSWORD = 'postgres123'
$psql = 'C:\Program Files\PostgreSQL\18\bin\psql.exe'

$sql = @"
-- Update orders with missing origin_warehouse_id based on pickup address or existing shipment origin
UPDATE orders o
SET origin_warehouse_id = s.origin_warehouse_id
FROM shipments s
WHERE s.order_id = o.id AND o.origin_warehouse_id IS NULL AND s.origin_warehouse_id IS NOT NULL;

-- If still null, resolve from pickup address city
UPDATE orders o
SET origin_warehouse_id = 6
FROM addresses a
WHERE o.pickup_address_id = a.id AND o.origin_warehouse_id IS NULL AND (a.city ILIKE '%kolkata%' OR a.city ILIKE '%west%' OR a.state ILIKE '%bengal%');

UPDATE orders o
SET origin_warehouse_id = 1
FROM addresses a
WHERE o.pickup_address_id = a.id AND o.origin_warehouse_id IS NULL;

-- Reconcile shipments: ensure shipment.origin_warehouse_id matches order.origin_warehouse_id
UPDATE shipments s
SET origin_warehouse_id = o.origin_warehouse_id
FROM orders o
WHERE s.order_id = o.id AND o.origin_warehouse_id IS NOT NULL AND (s.origin_warehouse_id IS NULL OR s.origin_warehouse_id <> o.origin_warehouse_id);

-- Set destination_warehouse_id to NULL to decouple from destination warehouse concept
UPDATE shipments
SET destination_warehouse_id = NULL
WHERE destination_warehouse_id IS NOT NULL;
"@

& $psql -U postgres -d primeroute_db -c "$sql"
