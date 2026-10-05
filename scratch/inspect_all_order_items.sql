SELECT 
  o.id as order_id, 
  o.order_number, 
  o.package_description, 
  o.package_quantity,
  count(oi.id) as item_count,
  string_agg(p.name || ' (qty:' || oi.quantity || ')', ', ') as items_summary
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
GROUP BY o.id, o.order_number, o.package_description, o.package_quantity
ORDER BY o.id DESC;
