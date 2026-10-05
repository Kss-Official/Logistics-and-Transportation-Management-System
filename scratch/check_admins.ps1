$env:PGPASSWORD = "postgres123"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d primeroute_db -c "SELECT id, email, full_name, role, status FROM users WHERE role LIKE '%ADMIN%';"
