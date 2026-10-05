$env:PGPASSWORD = 'postgres123'
$psql = 'C:\Program Files\PostgreSQL\18\bin\psql.exe'
& $psql -U postgres -d primeroute_db -c "\d vehicles"
