$env:PGPASSWORD='postgres123'
$psql = 'C:\Program Files\PostgreSQL\18\bin\psql.exe'

Write-Host "=== 1. SHIPMENT ROW ==="
& $psql -U postgres -d primeroute_db -h localhost -x -c "SELECT * FROM shipments WHERE tracking_number = 'PR-TRK-KZ3GJJ6X';"

Write-Host "=== 2. ORDER ROW & CUSTOMER ==="
& $psql -U postgres -d primeroute_db -h localhost -x -c "SELECT o.*, u.full_name as cust_name, u.email as cust_email FROM orders o LEFT JOIN users u ON o.customer_id = u.id WHERE o.id IN (SELECT order_id FROM shipments WHERE tracking_number = 'PR-TRK-KZ3GJJ6X');"

Write-Host "=== 3. TRACKING EVENTS ==="
& $psql -U postgres -d primeroute_db -h localhost -c "SELECT id, shipment_id, status, title, description, location_name, event_time FROM shipment_tracking_events WHERE shipment_id IN (SELECT id FROM shipments WHERE tracking_number = 'PR-TRK-KZ3GJJ6X') ORDER BY id ASC;"

Write-Host "=== 4. PROOF OF DELIVERY (ePOD) ==="
& $psql -U postgres -d primeroute_db -h localhost -x -c "SELECT * FROM proof_of_deliveries WHERE shipment_id IN (SELECT id FROM shipments WHERE tracking_number = 'PR-TRK-KZ3GJJ6X');"

Write-Host "=== 5. ALL SHIPMENTS SUMMARY ==="
& $psql -U postgres -d primeroute_db -h localhost -c "SELECT id, tracking_number, status, operational_stage, assignment_status, driver_id, vehicle_id, assigned_by, assigned_at FROM shipments ORDER BY id DESC LIMIT 10;"

Write-Host "=== 6. DRIVERS & VEHICLES ==="
& $psql -U postgres -d primeroute_db -h localhost -c "SELECT id, full_name, email, status, warehouse_id FROM drivers;"
& $psql -U postgres -d primeroute_db -h localhost -c "SELECT id, vehicle_number, model, status, warehouse_id FROM vehicles;"
