$env:PGPASSWORD = "postgres123"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d primeroute_db -c @"
-- Insert any missing driver users
INSERT INTO users (email, full_name, password, role, status, phone, warehouse_id, created_at)
SELECT 
    LOWER(TRIM(d.email)),
    TRIM(d.full_name),
    '$2a$10$usNfhOOyMd271rdrL6Cfx.e8CL84ccA7JtCQ/Vrfv8IS0OPCYU772',
    'DRIVER',
    'ACTIVE',
    d.phone,
    d.warehouse_id,
    NOW()
FROM drivers d
WHERE NOT EXISTS (
    SELECT 1 FROM users u WHERE LOWER(TRIM(u.email)) = LOWER(TRIM(d.email))
);

SELECT id, full_name, email, role, status, warehouse_id FROM users WHERE role = 'DRIVER';
"@
