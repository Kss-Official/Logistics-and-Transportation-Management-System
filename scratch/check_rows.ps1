$env:PGPASSWORD = 'postgres123'
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
& $psql -U postgres -d primeroute_db -h localhost -c "SELECT id, sku, name, category, unit_weight, unit_price FROM products;"
& $psql -U postgres -d primeroute_db -h localhost -c "SELECT id, warehouse_id, product_id, sku, total_stock, available_stock, reserved_stock FROM inventories LIMIT 10;"
& $psql -U postgres -d primeroute_db -h localhost -c "SELECT id, order_number, package_description, package_weight, package_quantity, origin_warehouse_id, status FROM orders ORDER BY id DESC LIMIT 5;"
& $psql -U postgres -d primeroute_db -h localhost -c "SELECT id, order_id, product_id, quantity, unit_weight, total_weight FROM order_items ORDER BY id DESC LIMIT 5;"
