$env:PGPASSWORD = 'postgres123'
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$hash = '$2a$10$cFJbiXZKijl6WMnJiayvFe5sKlfFBoHuX9c/H7ZQHjDJVKX7Wg4oG'

# Update sanjanaaa.shru@gmail.com
& $psql -U postgres -d primeroute_db -h localhost -c "UPDATE users SET password = '$hash' WHERE email = 'sanjanaaa.shru@gmail.com';"

# Check if admin@primeroute.com exists, if not insert it or update it so both work!
$checkAdmin = & $psql -U postgres -d primeroute_db -h localhost -t -c "SELECT COUNT(*) FROM users WHERE email = 'admin@primeroute.com';"
$count = [int]($checkAdmin.Trim())
if ($count -eq 0) {
    & $psql -U postgres -d primeroute_db -h localhost -c "INSERT INTO users (email, password, full_name, role, active, created_at, updated_at) VALUES ('admin@primeroute.com', '$hash', 'PrimeRoute Operations Admin', 'ADMIN', true, NOW(), NOW());"
    Write-Host "Created admin@primeroute.com with Sanjana@102026"
} else {
    & $psql -U postgres -d primeroute_db -h localhost -c "UPDATE users SET password = '$hash' WHERE email = 'admin@primeroute.com';"
    Write-Host "Updated admin@primeroute.com with Sanjana@102026"
}

& $psql -U postgres -d primeroute_db -h localhost -c "SELECT id, email, full_name, role FROM users WHERE role = 'ROLE_ADMIN' OR role = 'ADMIN';"
