# Step 2 Verification Script
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "STEP 2: FULL VALIDATION TEST SUITE" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Authenticate as Admin to obtain JWT token
$adminLogin = @{
    email = "sanjanaaa.shru@gmail.com"
    password = "Sanjana@102026"
} | ConvertTo-Json

$loginResp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $adminLogin
$token = $loginResp.token
Write-Host "[1] Admin Authenticated successfully. Token obtained." -ForegroundColor Green

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}

# 2. Test GET All Warehouses
$getAll = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/warehouses" -Method Get -Headers $headers
Write-Host "[2] GET /api/admin/warehouses returned $($getAll.data.Count) warehouses. Success: $($getAll.success)" -ForegroundColor Green

# 3. Test Rejection when using an ADMIN email as manager
$adminEmailReq = @{
    warehouseCode = "WH-TEST-ADM"
    warehouseName = "Admin Test Facility"
    warehouseType = "DISTRIBUTION_CENTER"
    managerName = "Admin Persona"
    managerEmail = "sanjanaaa.shru@gmail.com"
    managerPhone = "+91 99999 11111"
    addressLine1 = "123 Admin Lane"
    city = "Bengaluru"
    state = "Karnataka"
    postalCode = "560001"
    totalCapacity = 5000.0
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/warehouses" -Method Post -Headers $headers -Body $adminEmailReq
    Write-Host "ERROR: Admin email was NOT rejected!" -ForegroundColor Red
} catch {
    Write-Host "[3] Correctly REJECTED Admin email: $($_.Exception.Message)" -ForegroundColor Green
}

# 4. Test Rejection when using a CUSTOMER email as manager
$customerEmailReq = @{
    warehouseCode = "WH-TEST-CUST"
    warehouseName = "Customer Test Facility"
    warehouseType = "DISTRIBUTION_CENTER"
    managerName = "Customer Persona"
    managerEmail = "customer@primeroute.com"
    managerPhone = "+91 99999 22222"
    addressLine1 = "123 Customer Rd"
    city = "Bengaluru"
    state = "Karnataka"
    postalCode = "560001"
    totalCapacity = 5000.0
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/warehouses" -Method Post -Headers $headers -Body $customerEmailReq
    Write-Host "ERROR: Customer email was NOT rejected!" -ForegroundColor Red
} catch {
    Write-Host "[4] Correctly REJECTED Customer email: $($_.Exception.Message)" -ForegroundColor Green
}

# 5. Test Rejection when using a DRIVER email as manager
$driverEmailReq = @{
    warehouseCode = "WH-TEST-DRV"
    warehouseName = "Driver Test Facility"
    warehouseType = "DISTRIBUTION_CENTER"
    managerName = "Driver Persona"
    managerEmail = "ramesh@primeroute.com"
    managerPhone = "+91 99999 33333"
    addressLine1 = "123 Driver Rd"
    city = "Bengaluru"
    state = "Karnataka"
    postalCode = "560001"
    totalCapacity = 5000.0
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/warehouses" -Method Post -Headers $headers -Body $driverEmailReq
    Write-Host "ERROR: Driver email was NOT rejected!" -ForegroundColor Red
} catch {
    Write-Host "[5] Correctly REJECTED Driver email: $($_.Exception.Message)" -ForegroundColor Green
}

# 6. Test Creating a NEW Warehouse with a NEW Manager
$newWhReq = @{
    warehouseCode = "WH-AMD-009"
    warehouseName = "Ahmedabad Multimodal Hub"
    warehouseType = "DISTRIBUTION_CENTER"
    managerName = "Suresh Trivedi"
    managerEmail = "suresh.t@primeroute.com"
    managerPhone = "+91 98790 12345"
    addressLine1 = "Plot 88, GIDC Industrial Estate, Sanand"
    city = "Ahmedabad"
    state = "Gujarat"
    postalCode = "382110"
    totalCapacity = 12000.0
} | ConvertTo-Json

$newWhResp = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/warehouses" -Method Post -Headers $headers -Body $newWhReq
$createdWhId = $newWhResp.data.id
Write-Host "[6] Created New Warehouse id=$createdWhId (Code: $($newWhResp.data.warehouseCode))." -ForegroundColor Green

# 7. Test Login with the Newly Created Manager
$sureshLogin = @{
    email = "suresh.t@primeroute.com"
    password = "Manager@2026!"
} | ConvertTo-Json

try {
    $sureshResp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $sureshLogin
    Write-Host "[7] Suresh login SUCCESS: Role=$($sureshResp.role), WarehouseId=$($sureshResp.warehouseId), Code=$($sureshResp.warehouseCode)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Suresh login failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Test Updating Warehouse without changing manager email (Edit capacity, name, manager phone)
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

try {
    $updateResp = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/warehouses/$createdWhId" -Method Put -Headers $headers -Body $updateWhReq
    Write-Host "[8] Updated warehouse id=$createdWhId. New capacity=$($updateResp.data.totalCapacity), Manager=$($updateResp.data.managerName), Phone=$($updateResp.data.managerPhone)" -ForegroundColor Green
} catch {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errBody = $reader.ReadToEnd()
    Write-Host "[8 ERROR]: $errBody" -ForegroundColor Red
}

# Verify Suresh login still works with unchanged password
$sureshResp2 = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $sureshLogin
Write-Host "[8b] Suresh login after update SUCCESS: Password preserved! FullName=$($sureshResp2.fullName)." -ForegroundColor Green

# 9. Test Changing Manager Email (Reassigning Warehouse to a NEW Manager)
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

try {
    $reassignResp = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/warehouses/$createdWhId" -Method Put -Headers $headers -Body $reassignWhReq
    Write-Host "[9] Reassigned warehouse id=$createdWhId to Kavita Verma (kavita.v@primeroute.com)." -ForegroundColor Green
} catch {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errBody = $reader.ReadToEnd()
    Write-Host "[9 ERROR]: $errBody" -ForegroundColor Red
}

# 10. Verify Old Manager (Suresh) is unassigned from warehouse id
$sureshResp3 = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $sureshLogin
Write-Host "[10] Suresh login after reassignment: WarehouseId is now '$($sureshResp3.warehouseId)'. Unassigned properly: $([string]::IsNullOrEmpty($sureshResp3.warehouseId))" -ForegroundColor Green

# 11. Verify New Manager (Kavita) logs in with warehouse id assigned
$kavitaLogin = @{
    email = "kavita.v@primeroute.com"
    password = "Manager@2026!"
} | ConvertTo-Json

$kavitaResp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $kavitaLogin
Write-Host "[11] Kavita login SUCCESS: Role=$($kavitaResp.role), WarehouseId=$($kavitaResp.warehouseId), Code=$($kavitaResp.warehouseCode)" -ForegroundColor Green

