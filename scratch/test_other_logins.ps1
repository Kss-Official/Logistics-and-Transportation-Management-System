$tests = @(
    @{ email = "sanjanaaa.shru@gmail.com"; pwd = "Sanjana@102026"; expectedRole = "ROLE_ADMIN" },
    @{ email = "customer@primeroute.com"; pwd = "customer123"; expectedRole = "ROLE_CUSTOMER" },
    @{ email = "ramesh@primeroute.com"; pwd = "Driver@2026"; expectedRole = "ROLE_DRIVER" }
)

foreach ($t in $tests) {
    $payload = @{
        email = $t.email
        password = $t.pwd
    } | ConvertTo-Json

    try {
        $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $payload
        Write-Host "SUCCESS: $($t.email) -> Role: $($resp.role)" -ForegroundColor Green
    } catch {
        Write-Host "FAILED: $($t.email) -> $($_.Exception.Message)" -ForegroundColor Red
    }
}
