$env:PGPASSWORD = 'postgres123'
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
& $psql -U postgres -d primeroute_db -h localhost -c "SELECT id, warehouse_id, product_id, sku, product_name, total_stock, available_stock, reserved_stock FROM inventories WHERE product_id IS NOT NULL;"
