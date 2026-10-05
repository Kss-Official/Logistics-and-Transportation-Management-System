@echo off
set PGPASSWORD=postgres123
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d primeroute_db -h localhost -c "SELECT id, full_name, status, warehouse_id FROM drivers WHERE id IN (13, 15, 16, 17, 19);" -c "SELECT id, vehicle_number, status, warehouse_id, assigned_driver_id FROM vehicles WHERE id IN (8, 9);"
