@echo off
set PGPASSWORD=postgres123
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d primeroute_db -h localhost -f "d:\Transportation-Logistic\scratch\execute_customer_cleanup.sql"
