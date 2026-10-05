$env:PGPASSWORD = 'postgres123'
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$hash = '$2a$10$cFJbiXZKijl6WMnJiayvFe5sKlfFBoHuX9c/H7ZQHjDJVKX7Wg4oG'

& $psql -U postgres -d primeroute_db -h localhost -c "INSERT INTO users (email, password, full_name, role) VALUES ('admin@primeroute.com', '$hash', 'PrimeRoute Operations Admin', 'ADMIN') ON CONFLICT (email) DO UPDATE SET password = '$hash';"
& $psql -U postgres -d primeroute_db -h localhost -c "SELECT id, email, full_name, role FROM users WHERE role = 'ADMIN' OR role = 'ROLE_ADMIN';"
