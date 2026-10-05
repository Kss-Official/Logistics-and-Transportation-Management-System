@echo off
set PGPASSWORD=postgres123
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d primeroute_db -h localhost -c "SELECT id, vehicle_number, status, warehouse_id FROM vehicles WHERE id IN (8, 9);"
