$env:PGPASSWORD = "postgres123"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d primeroute_db -c @"
SELECT email, password FROM users WHERE email = 'ramesh@primeroute.com';
"@
