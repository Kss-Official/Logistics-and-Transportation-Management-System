-- Correct Order PR-ORD-19214882 origin warehouse to Kolkata Eastern Corridor Hub (ID 6)
UPDATE orders 
SET origin_warehouse_id = 6 
WHERE order_number = 'PR-ORD-19214882';

-- Correct linked Shipment PR-TRK-9352ES77 origin to Kolkata (ID 6) and destination to Bengaluru (ID 1)
UPDATE shipments 
SET origin_warehouse_id = 6,
    destination_warehouse_id = 1,
    current_location_name = 'Kolkata Eastern Corridor Hub (WH-CCU-006)',
    current_latitude = 22.5726,
    current_longitude = 88.3639
WHERE order_id = 48;

-- Update fulfillment allocation record if exists
UPDATE fulfillment_allocations 
SET warehouse_id = 6 
WHERE order_id = 48;

-- Update initial tracking events location for shipment 41
UPDATE shipment_tracking_events 
SET location_name = 'Kolkata Eastern Corridor Hub (WH-CCU-006)'
WHERE shipment_id = 41 AND status IN ('ORDER_CREATED', 'CONFIRMED');

-- Verification Query
SELECT o.id, o.order_number, o.status, o.origin_warehouse_id, pw.warehouse_name as origin_wh, pw.warehouse_code, pa.city as pickup_city, da.city as delivery_city 
FROM orders o 
LEFT JOIN warehouses pw ON o.origin_warehouse_id = pw.id 
LEFT JOIN addresses pa ON o.pickup_address_id = pa.id 
LEFT JOIN addresses da ON o.delivery_address_id = da.id 
WHERE o.order_number = 'PR-ORD-19214882';

SELECT s.id, s.tracking_number, s.status, s.operational_stage, s.driver_id, s.vehicle_id, s.origin_warehouse_id, ow.warehouse_name as origin_wh, ow.warehouse_code as origin_code, s.destination_warehouse_id, dw.warehouse_name as dest_wh, dw.warehouse_code as dest_code 
FROM shipments s 
LEFT JOIN warehouses ow ON s.origin_warehouse_id = ow.id 
LEFT JOIN warehouses dw ON s.destination_warehouse_id = dw.id 
WHERE s.order_id = 48;
