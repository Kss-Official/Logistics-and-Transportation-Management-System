$env:PGPASSWORD = "postgres123"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d primeroute_db -c @"
SELECT '--- DRIVERS TABLE ---' as section;
SELECT id, full_name, email, phone, license_number, status, warehouse_id FROM drivers;

SELECT '--- USERS TABLE (DRIVERS) ---' as section;
SELECT id, full_name, email, phone, role, status FROM users WHERE role = 'ROLE_DRIVER' OR role = 'DRIVER' OR email LIKE '%priya%';
"@
