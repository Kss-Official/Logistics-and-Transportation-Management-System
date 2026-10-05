$env:PGPASSWORD = 'postgres123'
$PSQL = 'C:\Program Files\PostgreSQL\18\bin\psql.exe'

Write-Host "=== ALL WAREHOUSE MANAGERS IN DATABASE ==="
& $PSQL -U postgres -d primeroute_db -c "SELECT u.id, u.email, u.full_name, u.role, u.status, u.warehouse_id, w.warehouse_code, w.warehouse_name, w.manager_name, w.manager_email FROM users u LEFT JOIN warehouses w ON u.warehouse_id = w.id WHERE u.role = 'WAREHOUSE_MANAGER' ORDER BY u.id;"









