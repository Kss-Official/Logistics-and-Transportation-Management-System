\x
-- STEP 1: Full details of the 2 target orders
SELECT 
  o.id,
  o.order_number,
  o.customer_id,
  u.email AS customer_email,
  u.full_name AS customer_name,
  o.status AS order_status,
  o.package_description,
  o.package_quantity,
  o.package_weight,
  o.delivery_type,
  o.total_amount,
  o.payment_method,
  o.payment_status,
  o.created_at
FROM orders o
LEFT JOIN users u ON o.customer_id = u.id
WHERE o.order_number IN ('PR-ORD-29842877', 'PR-ORD-74855865')
ORDER BY o.id;

-- STEP 2: Order Items
SELECT 
  oi.id AS order_item_id,
  oi.order_id,
  o.order_number,
  oi.product_id,
  p.name AS product_name,
  p.sku,
  oi.quantity,
  oi.unit_price,
  oi.unit_weight,
  oi.total_weight
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
LEFT JOIN products p ON oi.product_id = p.id
WHERE o.order_number IN ('PR-ORD-29842877', 'PR-ORD-74855865')
ORDER BY oi.id;

-- STEP 3: Invoices
SELECT 
  i.id AS invoice_id,
  i.invoice_number,
  i.order_id,
  o.order_number,
  i.total_amount,
  i.amount_paid,
  i.balance_due,
  i.payment_status,
  i.invoice_status,
  i.payment_method,
  i.payment_date,
  i.transaction_id,
  i.created_at
FROM invoices i
JOIN orders o ON i.order_id = o.id
WHERE o.order_number IN ('PR-ORD-29842877', 'PR-ORD-74855865')
ORDER BY i.id;

-- STEP 4: Shipments
SELECT 
  s.id AS shipment_id,
  s.tracking_number,
  s.order_id,
  o.order_number,
  s.status AS shipment_status,
  s.driver_id,
  s.vehicle_id,
  s.origin_warehouse_id,
  s.destination_warehouse_id,
  s.created_at
FROM shipments s
JOIN orders o ON s.order_id = o.id
WHERE o.order_number IN ('PR-ORD-29842877', 'PR-ORD-74855865')
ORDER BY s.id;

-- STEP 5: Shipment Tracking Events
SELECT 
  ste.id AS event_id,
  ste.shipment_id,
  s.tracking_number,
  o.order_number,
  ste.title,
  ste.status,
  ste.location_name,
  ste.event_time,
  ste.description
FROM shipment_tracking_events ste
JOIN shipments s ON ste.shipment_id = s.id
JOIN orders o ON s.order_id = o.id
WHERE o.order_number IN ('PR-ORD-29842877', 'PR-ORD-74855865')
ORDER BY ste.id;

-- STEP 6: Proof of Deliveries
SELECT 
  pod.id AS pod_id,
  pod.shipment_id,
  s.tracking_number,
  o.order_number,
  pod.recipient_name,
  pod.delivered_by,
  pod.delivered_at
FROM proof_of_deliveries pod
JOIN shipments s ON pod.shipment_id = s.id
JOIN orders o ON s.order_id = o.id
WHERE o.order_number IN ('PR-ORD-29842877', 'PR-ORD-74855865')
ORDER BY pod.id;

-- STEP 7: Fulfillment Allocations
SELECT 
  fa.id AS allocation_id,
  fa.order_id,
  o.order_number,
  fa.warehouse_id,
  fa.distance_km,
  fa.reason
FROM fulfillment_allocations fa
JOIN orders o ON fa.order_id = o.id
WHERE o.order_number IN ('PR-ORD-29842877', 'PR-ORD-74855865')
ORDER BY fa.id;

-- STEP 8: Inventory Transactions
SELECT 
  it.id AS tx_id,
  it.transaction_type,
  it.product_name,
  it.sku,
  it.quantity,
  it.previous_available,
  it.new_available,
  it.reference_order,
  it.reference_shipment,
  it.reason,
  it.warehouse_id,
  it.inventory_id,
  it.timestamp
FROM inventory_transactions it
WHERE it.reference_order IN ('PR-ORD-29842877', 'PR-ORD-74855865')
   OR it.reference_order IN ('870', '871')
ORDER BY it.id;
