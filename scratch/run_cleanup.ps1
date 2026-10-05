$env:PGPASSWORD = 'postgres123'
$PSQL = 'C:\Program Files\PostgreSQL\18\bin\psql.exe'

Write-Host "Running cleanup.sql..."
& $PSQL -U postgres -d primeroute_db -f "d:\Transportation-Logistic\scratch\cleanup.sql"

Write-Host "=== ACTIVE SHIPMENTS AFTER CLEANUP ==="
& $PSQL -U postgres -d primeroute_db -c "SELECT s.id, s.tracking_number, s.status, s.driver_id, d.full_name AS driver, s.vehicle_id, v.vehicle_number, v.driver_id AS veh_driver FROM shipments s LEFT JOIN drivers d ON s.driver_id = d.id LEFT JOIN vehicles v ON s.vehicle_id = v.id WHERE s.status NOT IN ('DELIVERED', 'CANCELLED') AND (s.driver_id IS NOT NULL OR s.vehicle_id IS NOT NULL) ORDER BY s.id;"
