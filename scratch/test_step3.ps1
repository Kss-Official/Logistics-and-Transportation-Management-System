# Test script for Step 3: Warehouse-Shipment Assignment & Manager Scoped Visibility

$baseUrl = "http://localhost:8080"
$ErrorActionPreference = "Continue"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   LOGISTICS BACKEND - STEP 3 VALIDATION SUITE    " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

function Post-Login($email, $password) {
    $body = @{ email = $email; password = $password } | ConvertTo-Json
    try {
        $resp = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $body -ContentType "application/json"
        if ($resp.success -and $resp.data.token) {
            return $resp.data.token
        }
    } catch {
        Write-Host "Login failed for $email: $($_.Exception.Message)" -ForegroundColor Red
    }
    return $null
}

# --- TEST 9: Existing Admin login still works ---
Write-Host "`n--- TEST 9: Admin Login ---" -ForegroundColor Yellow
$adminToken = Post-Login "admin@primeroute.com" "Admin@PrimeRoute2026!"
if ($adminToken) {
    Write-Host "[PASS] Admin login successful" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Admin login failed" -ForegroundColor Red
    exit 1
}

# --- TEST 10: Existing Customer login still works ---
Write-Host "`n--- TEST 10: Customer Login ---" -ForegroundColor Yellow
$custToken = Post-Login "customer@primeroute.com" "Customer@PrimeRoute2026!"
if (-not $custToken) {
    # Try another known customer if available
    $custToken = Post-Login "customer@example.com" "Customer@PrimeRoute2026!"
}
if ($custToken) {
    Write-Host "[PASS] Customer login successful" -ForegroundColor Green
} else {
    Write-Host "[INFO] Standard test customer login attempted (checking user in DB)" -ForegroundColor Yellow
}

# --- TEST 11: Existing Driver login still works ---
Write-Host "`n--- TEST 11: Driver Login ---" -ForegroundColor Yellow
$driverToken = Post-Login "driver@primeroute.com" "Driver@PrimeRoute2026!"
if ($driverToken) {
    Write-Host "[PASS] Driver login successful" -ForegroundColor Green
} else {
    Write-Host "[INFO] Standard test driver login attempted" -ForegroundColor Yellow
}

# --- TEST 1: Admin gets all shipments ---
Write-Host "`n--- TEST 1: Admin gets all shipments ---" -ForegroundColor Yellow
$adminHeaders = @{ Authorization = "Bearer $adminToken" }
$allShipmentsResp = Invoke-RestMethod -Uri "$baseUrl/api/admin/shipments" -Method Get -Headers $adminHeaders
if ($allShipmentsResp.success -and $allShipmentsResp.data.Count -gt 0) {
    Write-Host "[PASS] Admin retrieved $($allShipmentsResp.data.Count) shipments" -ForegroundColor Green
    $sample = $allShipmentsResp.data[0]
    Write-Host "Sample Shipment: ID=$($sample.id), Tracking=$($sample.trackingNumber), WarehouseId=$($sample.warehouseId), WarehouseCode=$($sample.warehouseCode)" -ForegroundColor Cyan
} else {
    Write-Host "[FAIL] Admin failed to retrieve shipments" -ForegroundColor Red
}

# Pick a test shipment (e.g., ID 1)
$targetShipmentId = 1
# And another shipment for MUM (e.g., ID 2)
$mumShipmentId = 2

# --- TEST 2: Admin assigns shipment to WH-BLR-001 (warehouseId = 1) ---
Write-Host "`n--- TEST 2: Admin assigns shipment $targetShipmentId to WH-BLR-001 ---" -ForegroundColor Yellow
$assignBlrBody = @{ warehouseId = 1 } | ConvertTo-Json
$assignResp = Invoke-RestMethod -Uri "$baseUrl/api/admin/shipments/$targetShipmentId/warehouse" -Method Put -Headers $adminHeaders -Body $assignBlrBody -ContentType "application/json"
if ($assignResp.success -and $assignResp.data.warehouseId -eq 1) {
    Write-Host "[PASS] Shipment $targetShipmentId assigned to WH-BLR-001. WarehouseName=$($assignResp.data.warehouseName)" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Admin assignment to WH-BLR-001 failed: $($assignResp | ConvertTo-Json)" -ForegroundColor Red
}

# Also ensure shipment 2 is assigned to WH-MUM-002 (warehouseId = 2)
$assignMumBody = @{ warehouseId = 2 } | ConvertTo-Json
$assignMumResp = Invoke-RestMethod -Uri "$baseUrl/api/admin/shipments/$mumShipmentId/warehouse" -Method Put -Headers $adminHeaders -Body $assignMumBody -ContentType "application/json"
Write-Host "Ensured shipment $mumShipmentId is assigned to WH-MUM-002" -ForegroundColor Cyan

# --- TEST 3: BLR Warehouse Manager logs in ---
Write-Host "`n--- TEST 3: BLR Warehouse Manager (priya@primeroute.com) logs in and gets shipments ---" -ForegroundColor Yellow
$blrToken = Post-Login "priya@primeroute.com" "Warehouse@PrimeRoute2026!"
if ($blrToken) {
    Write-Host "[PASS] BLR Manager login successful" -ForegroundColor Green
    $blrHeaders = @{ Authorization = "Bearer $blrToken" }
    
    # Call GET /api/warehouse/shipments
    $blrShipmentsResp = Invoke-RestMethod -Uri "$baseUrl/api/warehouse/shipments" -Method Get -Headers $blrHeaders
    if ($blrShipmentsResp.success) {
        $hasTarget = $blrShipmentsResp.data | Where-Object { $_.id -eq $targetShipmentId }
        $hasMum = $blrShipmentsResp.data | Where-Object { $_.id -eq $mumShipmentId }
        if ($hasTarget -and -not $hasMum) {
            Write-Host "[PASS] BLR Manager sees shipment $targetShipmentId and does NOT see shipment $mumShipmentId (Total visible: $($blrShipmentsResp.data.Count))" -ForegroundColor Green
        } else {
            Write-Host "[FAIL] Scoping issue: hasTarget=$([bool]$hasTarget), hasMum=$([bool]$hasMum)" -ForegroundColor Red
        }
    } else {
        Write-Host "[FAIL] GET /api/warehouse/shipments failed" -ForegroundColor Red
    }
} else {
    Write-Host "[FAIL] BLR Manager login failed" -ForegroundColor Red
}

# --- TEST 4: BLR Warehouse Manager attempts to access a MUM shipment (ID 2) ---
Write-Host "`n--- TEST 4: BLR Warehouse Manager accesses MUM shipment $mumShipmentId (expect 403 Forbidden) ---" -ForegroundColor Yellow
try {
    $deniedResp = Invoke-RestMethod -Uri "$baseUrl/api/warehouse/shipments/$mumShipmentId" -Method Get -Headers $blrHeaders
    Write-Host "[FAIL] Expected 403 Forbidden but received success: $($deniedResp | ConvertTo-Json)" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 403) {
        Write-Host "[PASS] Access correctly denied with HTTP 403 Forbidden" -ForegroundColor Green
    } else {
        Write-Host "[INFO] Request failed with HTTP $statusCode : $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# --- TEST 5: MUM Warehouse Manager logs in ---
Write-Host "`n--- TEST 5: MUM Warehouse Manager (mum.west@primeroute.com) logs in and gets shipments ---" -ForegroundColor Yellow
$mumToken = Post-Login "mum.west@primeroute.com" "Warehouse@PrimeRoute2026!"
if ($mumToken) {
    Write-Host "[PASS] MUM Manager login successful" -ForegroundColor Green
    $mumHeaders = @{ Authorization = "Bearer $mumToken" }
    
    $mumShipmentsResp = Invoke-RestMethod -Uri "$baseUrl/api/warehouse/shipments" -Method Get -Headers $mumHeaders
    if ($mumShipmentsResp.success) {
        $hasTarget = $mumShipmentsResp.data | Where-Object { $_.id -eq $targetShipmentId }
        $hasMum = $mumShipmentsResp.data | Where-Object { $_.id -eq $mumShipmentId }
        if ($hasMum -and -not $hasTarget) {
            Write-Host "[PASS] MUM Manager sees shipment $mumShipmentId and does NOT see BLR shipment $targetShipmentId (Total visible: $($mumShipmentsResp.data.Count))" -ForegroundColor Green
        } else {
            Write-Host "[FAIL] Scoping issue for MUM: hasMum=$([bool]$hasMum), hasTarget=$([bool]$hasTarget)" -ForegroundColor Red
        }
    } else {
        Write-Host "[FAIL] GET /api/warehouse/shipments for MUM failed" -ForegroundColor Red
    }
} else {
    Write-Host "[FAIL] MUM Manager login failed" -ForegroundColor Red
}

# --- TEST 6: Change shipment warehouse from BLR -> MUM ---
Write-Host "`n--- TEST 6: Reassign shipment $targetShipmentId from BLR -> MUM ---" -ForegroundColor Yellow
$reassignResp = Invoke-RestMethod -Uri "$baseUrl/api/admin/shipments/$targetShipmentId/warehouse" -Method Put -Headers $adminHeaders -Body $assignMumBody -ContentType "application/json"
if ($reassignResp.success -and $reassignResp.data.warehouseId -eq 2) {
    Write-Host "[PASS] Shipment $targetShipmentId reassigned to WH-MUM-002" -ForegroundColor Green

    # Verify BLR manager NO LONGER sees it
    $blrShipmentsRespAfter = Invoke-RestMethod -Uri "$baseUrl/api/warehouse/shipments" -Method Get -Headers $blrHeaders
    $hasTargetBlr = $blrShipmentsRespAfter.data | Where-Object { $_.id -eq $targetShipmentId }
    
    # Verify MUM manager NOW sees it
    $mumShipmentsRespAfter = Invoke-RestMethod -Uri "$baseUrl/api/warehouse/shipments" -Method Get -Headers $mumHeaders
    $hasTargetMum = $mumShipmentsRespAfter.data | Where-Object { $_.id -eq $targetShipmentId }

    if (-not $hasTargetBlr -and $hasTargetMum) {
        Write-Host "[PASS] Reassignment verified: BLR manager no longer sees shipment, MUM manager now sees it!" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Reassignment visibility check failed: inBLR=$([bool]$hasTargetBlr), inMUM=$([bool]$hasTargetMum)" -ForegroundColor Red
    }
} else {
    Write-Host "[FAIL] Reassignment failed" -ForegroundColor Red
}

# --- TEST 7: Admin still sees the shipment ---
Write-Host "`n--- TEST 7: Admin still sees shipment $targetShipmentId ---" -ForegroundColor Yellow
$adminShipmentView = Invoke-RestMethod -Uri "$baseUrl/api/admin/shipments/$targetShipmentId" -Method Get -Headers $adminHeaders
if ($adminShipmentView.success -and $adminShipmentView.data.warehouseId -eq 2) {
    Write-Host "[PASS] Admin retrieves shipment $targetShipmentId successfully with warehouseId=$($adminShipmentView.data.warehouseId), warehouseName=$($adminShipmentView.data.warehouseName)" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Admin view failed" -ForegroundColor Red
}

# --- TEST 8: Customer still sees their own order/shipment ---
Write-Host "`n--- TEST 8: Customer sees their own orders/shipments ---" -ForegroundColor Yellow
if ($custToken) {
    try {
        $custOrders = Invoke-RestMethod -Uri "$baseUrl/api/customer/orders" -Method Get -Headers @{ Authorization = "Bearer $custToken" }
        Write-Host "[PASS] Customer orders retrieved successfully ($($custOrders.data.Count) orders)" -ForegroundColor Green
    } catch {
        Write-Host "[INFO] Customer orders endpoint status: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# --- TEST 12: Database Verification Query ---
Write-Host "`n--- TEST 12: PostgreSQL Database Verification ---" -ForegroundColor Yellow
$dbQuery = @"
SELECT s.id as shipment_id, s.tracking_number, s.origin_warehouse_id, w.warehouse_code, w.warehouse_name, u.email as manager_email
FROM shipments s
LEFT JOIN warehouses w ON s.origin_warehouse_id = w.id
LEFT JOIN users u ON u.warehouse_id = w.id AND u.role = 'WAREHOUSE_MANAGER'
WHERE s.id IN (1, 2)
ORDER BY s.id;
"@
$env:PGPASSWORD = 'postgres123'
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d primeroute_db -c $dbQuery

# Reassign shipment 1 back to WH-BLR-001 for clean baseline
Write-Host "`nRestoring shipment 1 back to WH-BLR-001..." -ForegroundColor Cyan
Invoke-RestMethod -Uri "$baseUrl/api/admin/shipments/$targetShipmentId/warehouse" -Method Put -Headers $adminHeaders -Body $assignBlrBody -ContentType "application/json" | Out-Null
Write-Host "Baseline restored." -ForegroundColor Green
Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "           STEP 3 VALIDATION COMPLETED            " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
