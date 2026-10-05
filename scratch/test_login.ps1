$emails = @(
    "priya@primeroute.com",
    "mum.west@primeroute.com",
    "del.ncr@primeroute.com",
    "che.port@primeroute.com",
    "hyd.central@primeroute.com",
    "ccu.east@primeroute.com",
    "rajesh.p@primeroute.com"
)

foreach ($email in $emails) {
    $payload = @{
        email = $email
        password = "Manager@2026!"
    } | ConvertTo-Json

    try {
        $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $payload
        Write-Host "SUCCESS: $email -> Role: $($resp.role), WarehouseId: $($resp.warehouseId), WarehouseCode: $($resp.warehouseCode), WarehouseName: $($resp.warehouseName)" -ForegroundColor Green
    } catch {
        Write-Host "FAILED: $email -> $($_.Exception.Message)" -ForegroundColor Red
    }
}
