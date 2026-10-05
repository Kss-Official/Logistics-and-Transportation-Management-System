$env:PGPASSWORD = 'postgres123'
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
& $psql -U postgres -d primeroute_db -h localhost -c "SELECT id, email, full_name, role, password FROM users WHERE id IN (1, 4);"
