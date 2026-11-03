$env:PGPASSWORD = "postgres123"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d primeroute_db -f "d:\Transportation-Logistic\scratch\check_invoice_status.sql"
