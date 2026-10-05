$env:PGPASSWORD='postgres123'
$psql = 'C:\Program Files\PostgreSQL\18\bin\psql.exe'

Write-Host "=== WAREHOUSES ==="
& $psql -U postgres -d primeroute_db -h localhost -c "SELECT id, warehouse_code, warehouse_name, city, status FROM warehouses ORDER BY id;"

Write-Host "=== WAREHOUSE MANAGERS ==="
& $psql -U postgres -d primeroute_db -h localhost -c "SELECT id, email, full_name, role, warehouse_id FROM users WHERE role = 'WAREHOUSE_MANAGER' ORDER BY id;"

Write-Host "=== DRIVERS ==="
& $psql -U postgres -d primeroute_db -h localhost -c "SELECT id, full_name, email, status, warehouse_id, user_id FROM drivers ORDER BY id;"

Write-Host "=== VEHICLES ==="
& $psql -U postgres -d primeroute_db -h localhost -c "SELECT id, vehicle_number, vehicle_type, status, warehouse_id, assigned_driver_id FROM vehicles ORDER BY id;"

Write-Host "=== SHIPMENTS (recent 25) ==="
& $psql -U postgres -d primeroute_db -h localhost -c "SELECT id, tracking_number, origin_warehouse_id, destination_warehouse_id, operational_stage, status, driver_id, vehicle_id, assignment_status FROM shipments ORDER BY id DESC LIMIT 25;"

Write-Host "=== ACTIVE SHIPMENTS WITH DRIVER/VEHICLE ==="
& $psql -U postgres -d primeroute_db -h localhost -c "SELECT id, tracking_number, origin_warehouse_id, destination_warehouse_id, driver_id, vehicle_id, operational_stage, status FROM shipments WHERE (driver_id IS NOT NULL OR vehicle_id IS NOT NULL) AND status NOT IN ('DELIVERED', 'CANCELLED');"
