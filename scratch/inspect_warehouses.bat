@echo off
set PGPASSWORD=postgres123
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d primeroute_db -h localhost -c "SELECT id, warehouse_code, warehouse_name, city, state FROM warehouses ORDER BY id;"
