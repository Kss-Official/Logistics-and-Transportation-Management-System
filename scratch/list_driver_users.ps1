$PSQL = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$env:PGPASSWORD = "postgres123"
& $PSQL -U postgres -d primeroute_db -c "\d users"
& $PSQL -U postgres -d primeroute_db -c "SELECT id, email, full_name, role FROM users WHERE role = 'DRIVER';"
