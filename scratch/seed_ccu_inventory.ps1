$env:PGPASSWORD = "postgres123"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d primeroute_db -c @"
-- 1. Insert inventory for WH-CCU-006 (id: 6) for all products in products table if missing
INSERT INTO inventories (
    warehouse_id, product_id, sku, product_name, category,
    total_stock, available_stock, reserved_stock, damaged_stock,
    reorder_level, unit_price, unit, status, created_at, updated_at
)
SELECT
    6, p.id, p.sku, p.name, p.category,
    CASE 
        WHEN p.sku = 'PR-LAP-001' THEN 50
        WHEN p.sku = 'PR-KBD-001' THEN 120
        WHEN p.sku = 'PR-MON-001' THEN 40
        ELSE 35
    END,
    CASE 
        WHEN p.sku = 'PR-LAP-001' THEN 50
        WHEN p.sku = 'PR-KBD-001' THEN 120
        WHEN p.sku = 'PR-MON-001' THEN 40
        ELSE 35
    END,
    0, 0,
    p.reorder_level, p.unit_price, p.unit_of_measure, 'IN_STOCK',
    NOW(), NOW()
FROM products p
WHERE NOT EXISTS (
    SELECT 1 FROM inventories i WHERE i.warehouse_id = 6 AND (i.product_id = p.id OR i.sku = p.sku)
);

-- 2. Remediate order PR-ORD-76406402 (Order ID: 55, Pickup Address ID: 32)
-- Correct Address 32 city and state
UPDATE addresses
SET city = 'Kolkata', state = 'West Bengal', latitude = 22.5726, longitude = 88.3639
WHERE id = 32;

-- Correct Order 55 origin_warehouse_id to 6 (WH-CCU-006)
UPDATE orders
SET origin_warehouse_id = 6, updated_at = NOW()
WHERE id = 55;

-- Correct Shipment 48 origin_warehouse_id to 6, destination_warehouse_id to NULL
UPDATE shipments
SET origin_warehouse_id = 6, destination_warehouse_id = NULL, updated_at = NOW()
WHERE id = 48;

-- Correct FulfillmentAllocation 9 warehouse_id to 6
UPDATE fulfillment_allocations
SET warehouse_id = 6, updated_at = NOW()
WHERE id = 9;

-- Adjust reserved inventory for Order 55 (4 units of PR-PRN-001)
-- At WH-CCU-006: reserve 4 units
UPDATE inventories
SET reserved_stock = reserved_stock + 4, available_stock = total_stock - (reserved_stock + 4), updated_at = NOW()
WHERE warehouse_id = 6 AND sku = 'PR-PRN-001';

-- At WH-BLR-001: unreserve 4 units
UPDATE inventories
SET reserved_stock = GREATEST(0, reserved_stock - 4), available_stock = total_stock - GREATEST(0, reserved_stock - 4), updated_at = NOW()
WHERE warehouse_id = 1 AND sku = 'PR-PRN-001';
"@
