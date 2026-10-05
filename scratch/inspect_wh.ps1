$env:PGPASSWORD = 'postgres123'
$psql = 'C:\Program Files\PostgreSQL\18\bin\psql.exe'
& $psql -U postgres -d primeroute_db -c "SELECT id, warehouse_code, warehouse_name, city, state, status FROM warehouses ORDER BY id;"
