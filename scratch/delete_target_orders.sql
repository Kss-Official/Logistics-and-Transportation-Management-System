BEGIN;

-- 1. Snapshot counts before deletion
SELECT 
  (SELECT COUNT(*) FROM orders) AS initial_orders_count,
  (SELECT COUNT(*) FROM invoices) AS initial_invoices_count,
  (SELECT COUNT(*) FROM users) AS initial_users_count,
  (SELECT COUNT(*) FROM warehouses) AS initial_warehouses_count,
  (SELECT COUNT(*) FROM drivers) AS initial_drivers_count,
  (SELECT COUNT(*) FROM vehicles) AS initial_vehicles_count,
  (SELECT COUNT(*) FROM products) AS initial_products_count,
  (SELECT COUNT(*) FROM addresses) AS initial_addresses_count;

-- 2. Delete fulfillment allocations for the 2 orders
DELETE FROM fulfillment_allocations 
WHERE order_id IN (
  SELECT id FROM orders WHERE order_number IN ('PR-ORD-29842877', 'PR-ORD-74855865')
);

-- 3. Delete invoices for the 2 orders
DELETE FROM invoices 
WHERE order_id IN (
  SELECT id FROM orders WHERE order_number IN ('PR-ORD-29842877', 'PR-ORD-74855865')
) OR invoice_number IN ('INV-PR-ORD-29842877', 'INV-PR-ORD-74855865');

-- 4. Delete notifications directly referencing the 2 orders
DELETE FROM notifications 
WHERE message LIKE '%PR-ORD-29842877%' 
   OR message LIKE '%PR-ORD-74855865%'
   OR title LIKE '%PR-ORD-29842877%'
   OR title LIKE '%PR-ORD-74855865%';

-- 5. Delete order items if any exist
DELETE FROM order_items 
WHERE order_id IN (
  SELECT id FROM orders WHERE order_number IN ('PR-ORD-29842877', 'PR-ORD-74855865')
);

-- 6. Delete shipments if any exist
DELETE FROM shipments 
WHERE order_id IN (
  SELECT id FROM orders WHERE order_number IN ('PR-ORD-29842877', 'PR-ORD-74855865')
);

-- 7. Delete the 2 orders
DELETE FROM orders 
WHERE order_number IN ('PR-ORD-29842877', 'PR-ORD-74855865');

-- 8. Verify post-deletion counts
SELECT 
  (SELECT COUNT(*) FROM orders) AS final_orders_count,
  (SELECT COUNT(*) FROM invoices) AS final_invoices_count,
  (SELECT COUNT(*) FROM users) AS final_users_count,
  (SELECT COUNT(*) FROM warehouses) AS final_warehouses_count,
  (SELECT COUNT(*) FROM drivers) AS final_drivers_count,
  (SELECT COUNT(*) FROM vehicles) AS final_vehicles_count,
  (SELECT COUNT(*) FROM products) AS final_products_count,
  (SELECT COUNT(*) FROM addresses) AS final_addresses_count;

-- 9. Check if either order or invoice still exists
SELECT COUNT(*) AS remaining_target_orders 
FROM orders 
WHERE order_number IN ('PR-ORD-29842877', 'PR-ORD-74855865');

SELECT COUNT(*) AS remaining_target_invoices 
FROM invoices 
WHERE invoice_number IN ('INV-PR-ORD-29842877', 'INV-PR-ORD-74855865');

COMMIT;
