$env:PGPASSWORD = 'postgres123'
$psql = 'C:\Program Files\PostgreSQL\18\bin\psql.exe'
& $psql -U postgres -d primeroute_db -c "SELECT v.id, v.vehicle_number, v.model, v.status, v.warehouse_id, w.warehouse_code, v.driver_id, d.full_name AS driver_name FROM vehicles v LEFT JOIN warehouses w ON v.warehouse_id = w.id LEFT JOIN drivers d ON v.driver_id = d.id ORDER BY v.id;"
