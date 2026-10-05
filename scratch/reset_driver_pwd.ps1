$env:PGPASSWORD = "postgres123"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d primeroute_db -c @"
UPDATE users SET password = NULL WHERE role = 'DRIVER';
SELECT id, email, password, role FROM users WHERE role = 'DRIVER';
"@
