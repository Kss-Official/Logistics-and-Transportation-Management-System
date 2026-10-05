-- Reconcile legacy delivered and cancelled shipments
UPDATE shipments
SET operational_stage = 'DISPATCHED'
WHERE status = 'DELIVERED'
  AND (operational_stage IS NULL OR operational_stage IN ('PICKING', 'READY_FOR_PROCESSING', 'PACKED', 'READY_FOR_DISPATCH'));

UPDATE shipments
SET operational_stage = 'CANCELLED'
WHERE status = 'CANCELLED'
  AND (operational_stage IS NULL OR operational_stage IN ('PICKING', 'READY_FOR_PROCESSING', 'PACKED', 'READY_FOR_DISPATCH'));

-- Verify resulting rows
SELECT id, tracking_number, status, operational_stage, origin_warehouse_id, destination_warehouse_id
FROM shipments
ORDER BY id;
