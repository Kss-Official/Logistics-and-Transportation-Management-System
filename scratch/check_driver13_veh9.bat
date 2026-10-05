@echo off
set PGPASSWORD=postgres123
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d primeroute_db -h localhost -c "SELECT s.id, s.tracking_number, s.status, s.driver_id, d.full_name, s.vehicle_id, v.vehicle_number FROM shipments s LEFT JOIN drivers d ON s.driver_id = d.id LEFT JOIN vehicles v ON s.vehicle_id = v.id WHERE s.driver_id = 13 OR s.vehicle_id = 9;"
