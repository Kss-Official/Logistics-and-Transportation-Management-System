# Step 2 Updates Test Script
$adminLogin = @{
    email = "sanjanaaa.shru@gmail.com"
    password = "Sanjana@102026"
} | ConvertTo-Json

$loginResp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $adminLogin
$token = $loginResp.token
Write-Host "[1] Admin Authenticated. Token obtained." -ForegroundColor Green

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}

# 1. Update Warehouse 9 without changing manager email
Write-Host "`n--- TEST: Update warehouse without changing manager email ---" -ForegroundColor Cyan
$updateWhReq = @{
    warehouseCode = "WH-AMD-009"
    warehouseName = "Ahmedabad Mega Multimodal Hub"
    warehouseType = "DISTRIBUTION_CENTER"
    status = "ACTIVE"
    managerName = "Suresh K. Trivedi"
    managerEmail = "suresh.t@primeroute.com"
    managerPhone = "+91 98790 99999"
    addressLine1 = "Plot 88, GIDC Industrial Estate, Sanand"
    city = "Ahmedabad"
    state = "Gujarat"
    postalCode = "382110"
    totalCapacity = 14000.0
    capacityUnit = "KG"
} | ConvertTo-Json

$updateResp = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/warehouses/9" -Method Put -Headers $headers -Body $updateWhReq
Write-Host "Updated WH-AMD-009: Manager=$($updateResp.data.managerName), Phone=$($updateResp.data.managerPhone), Capacity=$($updateResp.data.totalCapacity)" -ForegroundColor Green

# Verify Suresh login
$sureshLogin = @{
    email = "suresh.t@primeroute.com"
    password = "Manager@2026!"
} | ConvertTo-Json

$sureshResp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $sureshLogin
Write-Host "Suresh Login: Success! Name=$($sureshResp.fullName), WarehouseId=$($sureshResp.warehouseId), Role=$($sureshResp.role)" -ForegroundColor Green

# 2. Reassign Warehouse 9 to a NEW manager (Kavita Verma)
Write-Host "`n--- TEST: Reassign warehouse to new manager (kavita.v@primeroute.com) ---" -ForegroundColor Cyan
$reassignWhReq = @{
    warehouseCode = "WH-AMD-009"
    warehouseName = "Ahmedabad Mega Multimodal Hub"
    warehouseType = "DISTRIBUTION_CENTER"
    status = "ACTIVE"
    managerName = "Kavita Verma"
    managerEmail = "kavita.v@primeroute.com"
    managerPhone = "+91 98790 55555"
    addressLine1 = "Plot 88, GIDC Industrial Estate, Sanand"
    city = "Ahmedabad"
    state = "Gujarat"
    postalCode = "382110"
    totalCapacity = 14000.0
    capacityUnit = "KG"
} | ConvertTo-Json

$reassignResp = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/warehouses/9" -Method Put -Headers $headers -Body $reassignWhReq
Write-Host "Reassigned WH-AMD-009 to: $($reassignResp.data.managerName) ($($reassignResp.data.managerEmail))" -ForegroundColor Green

# Verify Old Manager (Suresh) is now unassigned
$sureshRespAfter = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $sureshLogin
Write-Host "Old Manager (Suresh) after reassignment: WarehouseId is '$($sureshRespAfter.warehouseId)' (Unassigned: $([string]::IsNullOrEmpty($sureshRespAfter.warehouseId)))" -ForegroundColor Green

# Verify New Manager (Kavita) was created and logs in
$kavitaLogin = @{
    email = "kavita.v@primeroute.com"
    password = "Manager@2026!"
} | ConvertTo-Json

$kavitaResp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $kavitaLogin
Write-Host "New Manager (Kavita) Login: Success! Name=$($kavitaResp.fullName), WarehouseId=$($kavitaResp.warehouseId), Role=$($kavitaResp.role)" -ForegroundColor Green

# 3. Reassign Warehouse 9 BACK to Suresh (Existing Manager reuse)
Write-Host "`n--- TEST: Reassign warehouse back to Suresh (Existing User reuse) ---" -ForegroundColor Cyan
$reassignBackReq = @{
    warehouseCode = "WH-AMD-009"
    warehouseName = "Ahmedabad Mega Multimodal Hub"
    warehouseType = "DISTRIBUTION_CENTER"
    status = "ACTIVE"
    managerName = "Suresh Trivedi"
    managerEmail = "suresh.t@primeroute.com"
    managerPhone = "+91 98790 12345"
    addressLine1 = "Plot 88, GIDC Industrial Estate, Sanand"
    city = "Ahmedabad"
    state = "Gujarat"
    postalCode = "382110"
    totalCapacity = 14000.0
    capacityUnit = "KG"
} | ConvertTo-Json

$reassignBackResp = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/warehouses/9" -Method Put -Headers $headers -Body $reassignBackReq
Write-Host "Reassigned back to: $($reassignBackResp.data.managerName) ($($reassignBackResp.data.managerEmail))" -ForegroundColor Green

# Verify Suresh is assigned warehouse 9 again with same password
$sureshRespFinal = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $sureshLogin
Write-Host "Suresh final login: WarehouseId=$($sureshRespFinal.warehouseId), Password preserved!" -ForegroundColor Green

# Verify Kavita is now unassigned
$kavitaRespFinal = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $kavitaLogin
Write-Host "Kavita final login: WarehouseId is '$($kavitaRespFinal.warehouseId)' (Unassigned: $([string]::IsNullOrEmpty($kavitaRespFinal.warehouseId)))" -ForegroundColor Green
