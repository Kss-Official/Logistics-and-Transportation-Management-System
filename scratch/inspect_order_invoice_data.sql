\x
-- 1. Inspect Order
SELECT * FROM orders WHERE order_number = 'PR-ORD-01478158';

-- 2. Inspect Order Items and Product
SELECT 
  oi.id AS order_item_id,
  oi.order_id,
  oi.product_id,
  p.name AS product_name,
  p.sku,
  p.unit_price AS product_catalog_price,
  oi.quantity,
  oi.unit_price,
  oi.unit_weight,
  oi.total_weight
FROM order_items oi
LEFT JOIN products p ON oi.product_id = p.id
WHERE oi.order_id IN (SELECT id FROM orders WHERE order_number = 'PR-ORD-01478158');

-- 3. Inspect Invoices
SELECT * FROM invoices WHERE order_id IN (SELECT id FROM orders WHERE order_number = 'PR-ORD-01478158');

-- 4. Check if there are any invoice items table in database
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%invoice%';
