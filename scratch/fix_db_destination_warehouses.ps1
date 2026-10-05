$env:PGPASSWORD='postgres123'
$psql = 'C:\Program Files\PostgreSQL\18\bin\psql.exe'

Write-Host "Updating shipments where origin_warehouse_id = destination_warehouse_id..."
& $psql -U postgres -d primeroute_db -h localhost -c "UPDATE shipments SET destination_warehouse_id = 2 WHERE origin_warehouse_id = 1 AND destination_warehouse_id = 1;"
& $psql -U postgres -d primeroute_db -h localhost -c "UPDATE shipments SET destination_warehouse_id = 1 WHERE origin_warehouse_id = 2 AND destination_warehouse_id = 2;"

Write-Host "Verifying updated shipments..."
& $psql -U postgres -d primeroute_db -h localhost -c "SELECT id, tracking_number, origin_warehouse_id, destination_warehouse_id, operational_stage, status FROM shipments WHERE tracking_number = 'TRK-PR-KSBPLFWQ';"
