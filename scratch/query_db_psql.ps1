$env:PGPASSWORD = "postgres123"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d primeroute_db -c "SELECT id, tracking_number, status, operational_stage, driver_id, vehicle_id, origin_warehouse_id, destination_warehouse_id FROM shipments WHERE origin_warehouse_id = 1 ORDER BY id ASC;"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d primeroute_db -c "SELECT operational_stage, status, count(*) FROM shipments WHERE origin_warehouse_id = 1 GROUP BY operational_stage, status ORDER BY operational_stage;"
