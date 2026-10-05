@echo off
set PGPASSWORD=postgres123
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d primeroute_db -h localhost -c "SELECT id, subject, status, customer_id, order_number, tracking_number FROM support_tickets WHERE customer_id = 4;"
