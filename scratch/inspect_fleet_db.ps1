$env:PGPASSWORD = 'postgres123'
$psql = 'C:\Program Files\PostgreSQL\18\bin\psql.exe'
Write-Host "=== USERS (WAREHOUSE MANAGERS) ==="
& $psql -U postgres -d primeroute_db -c "SELECT id, email, full_name, role, warehouse_id FROM users WHERE role = 'WAREHOUSE_MANAGER';"

Write-Host "=== DRIVERS ==="
& $psql -U postgres -d primeroute_db -c "SELECT id, full_name, email, phone, status, warehouse_id FROM drivers ORDER BY id;"

Write-Host "=== VEHICLES ==="
& $psql -U postgres -d primeroute_db -c "SELECT id, vehicle_number, model, status, warehouse_id, assigned_driver_id FROM vehicles ORDER BY id;"
