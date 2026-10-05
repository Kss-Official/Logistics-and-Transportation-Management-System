@echo off
set PGPASSWORD=postgres123
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d primeroute_db -h localhost -c "SELECT s.id, s.tracking_number, s.status, s.operational_stage, s.origin_warehouse_id, ow.warehouse_code AS origin_wh, s.destination_warehouse_id, dw.warehouse_code AS dest_wh, o.customer_id, u.email FROM shipments s LEFT JOIN orders o ON s.order_id = o.id LEFT JOIN users u ON o.customer_id = u.id LEFT JOIN warehouses ow ON s.origin_warehouse_id = ow.id LEFT JOIN warehouses dw ON s.destination_warehouse_id = dw.id ORDER BY s.id;"
