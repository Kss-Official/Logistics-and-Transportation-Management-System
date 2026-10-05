@echo off
set PGPASSWORD=postgres123
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d primeroute_db -h localhost -c "\d fulfillment_allocations" -c "\d invoices" -c "\d addresses"
