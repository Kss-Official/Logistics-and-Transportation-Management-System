$env:PGPASSWORD = "postgres123"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d primeroute_db -c @"
SELECT email, password, role FROM users WHERE email = 'admin@primeroute.com' OR email = 'priya@primeroute.com';
"@
