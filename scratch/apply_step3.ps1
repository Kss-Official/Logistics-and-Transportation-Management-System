$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
$backendBase = "C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management\src\main\java\com\primeroute\logistics"

Write-Host "=== Applying Step 3 Backend Changes ===" -ForegroundColor Cyan

# 1. Create AssignWarehouseRequest.java
$assignWarehouseRequestPath = "$backendBase\dto\AssignWarehouseRequest.java"
$assignWarehouseRequestContent = @'
package com.primeroute.logistics.dto;

import jakarta.validation.constraints.NotNull;

public class AssignWarehouseRequest {

    @NotNull(message = "Warehouse ID is required")
    private Long warehouseId;

    public AssignWarehouseRequest() {}

    public AssignWarehouseRequest(Long warehouseId) {
        this.warehouseId = warehouseId;
    }

    public Long getWarehouseId() {
        return warehouseId;
    }

    public void setWarehouseId(Long warehouseId) {
        this.warehouseId = warehouseId;
    }
}
'@
[System.IO.File]::WriteAllText($assignWarehouseRequestPath, $assignWarehouseRequestContent, $utf8WithoutBom)
Write-Host "[1/8] Created AssignWarehouseRequest.java" -ForegroundColor Green

# 2. Update AdminShipmentDTO.java
$adminShipmentDTOPath = "$backendBase\dto\AdminShipmentDTO.java"
$adminShipmentDTOCode = [System.IO.File]::ReadAllText($adminShipmentDTOPath, [System.Text.Encoding]::UTF8)

if (-not $adminShipmentDTOCode.Contains("private Long warehouseId;")) {
    $target = "    private String currentLocation;"
    $replacement = @"
    private String currentLocation;

    // Warehouse details
    private String shipmentNumber;
    private Long warehouseId;
    private String warehouseCode;
    private String warehouseName;
"@
    $adminShipmentDTOCode = $adminShipmentDTOCode.Replace($target, $replacement)

    $getterSetterTarget = "    public List<AdminShipmentTrackingEventDTO> getEvents() { return events; }"
    $getterSetterReplacement = @"
    public String getShipmentNumber() { return shipmentNumber != null ? shipmentNumber : trackingNumber; }
    public void setShipmentNumber(String shipmentNumber) { this.shipmentNumber = shipmentNumber; }

    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }

    public String getWarehouseCode() { return warehouseCode; }
    public void setWarehouseCode(String warehouseCode) { this.warehouseCode = warehouseCode; }

    public String getWarehouseName() { return warehouseName; }
    public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }

    public List<AdminShipmentTrackingEventDTO> getEvents() { return events; }
"@
    $adminShipmentDTOCode = $adminShipmentDTOCode.Replace($getterSetterTarget, $getterSetterReplacement)
    [System.IO.File]::WriteAllText($adminShipmentDTOPath, $adminShipmentDTOCode, $utf8WithoutBom)
    Write-Host "[2/8] Updated AdminShipmentDTO.java" -ForegroundColor Green
} else {
    Write-Host "[2/8] AdminShipmentDTO.java already has warehouse fields" -ForegroundColor Yellow
}

# 3. Update WarehouseShipmentDTO.java
$warehouseShipmentDTOPath = "$backendBase\dto\warehouse\WarehouseShipmentDTO.java"
$warehouseShipmentDTOCode = [System.IO.File]::ReadAllText($warehouseShipmentDTOPath, [System.Text.Encoding]::UTF8)

if (-not $warehouseShipmentDTOCode.Contains("private String shipmentNumber;")) {
    $whDtoTarget = "    private String operationalStage;"
    $whDtoReplacement = @"
    private String operationalStage;
    private String shipmentNumber;
    private String warehouseCode;
    private String warehouseName;

    // Customer
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
"@
    $warehouseShipmentDTOCode = $warehouseShipmentDTOCode.Replace($whDtoTarget, $whDtoReplacement)

    $whDtoMethodTarget = "    public Long getId() { return id; }"
    $whDtoMethodReplacement = @"
    public String getShipmentNumber() { return shipmentNumber != null ? shipmentNumber : trackingNumber; }
    public void setShipmentNumber(String shipmentNumber) { this.shipmentNumber = shipmentNumber; }

    public String getWarehouseCode() { return warehouseCode; }
    public void setWarehouseCode(String warehouseCode) { this.warehouseCode = warehouseCode; }

    public String getWarehouseName() { return warehouseName; }
    public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public Long getId() { return id; }
"@
    $warehouseShipmentDTOCode = $warehouseShipmentDTOCode.Replace($whDtoMethodTarget, $whDtoMethodReplacement)
    [System.IO.File]::WriteAllText($warehouseShipmentDTOPath, $warehouseShipmentDTOCode, $utf8WithoutBom)
    Write-Host "[3/8] Updated WarehouseShipmentDTO.java" -ForegroundColor Green
} else {
    Write-Host "[3/8] WarehouseShipmentDTO.java already has required fields" -ForegroundColor Yellow
}

# 4. Update ShipmentRepository.java (eager load originWarehouse in findAllWithDetails)
$shipmentRepoPath = "$backendBase\repository\ShipmentRepository.java"
$shipmentRepoCode = [System.IO.File]::ReadAllText($shipmentRepoPath, [System.Text.Encoding]::UTF8)

if (-not $shipmentRepoCode.Contains("LEFT JOIN FETCH s.originWarehouse ow")) {
    $repoTarget = '           "LEFT JOIN FETCH s.vehicle v " +'
    $repoReplacement = @"
           "LEFT JOIN FETCH s.vehicle v " +
           "LEFT JOIN FETCH s.originWarehouse ow " +
"@
    $shipmentRepoCode = $shipmentRepoCode.Replace($repoTarget, $repoReplacement)
    [System.IO.File]::WriteAllText($shipmentRepoPath, $shipmentRepoCode, $utf8WithoutBom)
    Write-Host "[4/8] Updated ShipmentRepository.java" -ForegroundColor Green
} else {
    Write-Host "[4/8] ShipmentRepository.java already eager loads originWarehouse" -ForegroundColor Yellow
}

# 5. Update AdminShipmentService.java
$adminShipmentServicePath = "$backendBase\service\AdminShipmentService.java"
$adminShipmentServiceCode = [System.IO.File]::ReadAllText($adminShipmentServicePath, [System.Text.Encoding]::UTF8)

if (-not $adminShipmentServiceCode.Contains("assignWarehouse(")) {
    # Add WarehouseRepository import if missing
    if (-not $adminShipmentServiceCode.Contains("import com.primeroute.logistics.repository.WarehouseRepository;")) {
        $adminShipmentServiceCode = $adminShipmentServiceCode.Replace(
            "import com.primeroute.logistics.repository.VehicleRepository;",
            "import com.primeroute.logistics.repository.VehicleRepository;`nimport com.primeroute.logistics.repository.WarehouseRepository;"
        )
    }

    # Add WarehouseRepository field
    $adminShipmentServiceCode = $adminShipmentServiceCode.Replace(
        "    private final GeocodingService geocodingService;",
        "    private final GeocodingService geocodingService;`n    private final WarehouseRepository warehouseRepository;"
    )

    # Add WarehouseRepository constructor injection
    $adminShipmentServiceCode = $adminShipmentServiceCode.Replace(
        "            GeocodingService geocodingService) {",
        "            GeocodingService geocodingService,`n            WarehouseRepository warehouseRepository) {"
    )
    $adminShipmentServiceCode = $adminShipmentServiceCode.Replace(
        "        this.geocodingService = geocodingService;",
        "        this.geocodingService = geocodingService;`n        this.warehouseRepository = warehouseRepository;"
    )

    # Add assignWarehouse method before convertToDto
    $assignWarehouseMethod = @'
    // ==========================================
    // 4C. ASSIGN / CHANGE WAREHOUSE FOR SHIPMENT (STEP 3)
    // ==========================================
    public AdminShipmentDTO assignWarehouse(Long shipmentId, Long warehouseId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + shipmentId));

        if (warehouseId == null) {
            shipment.setOriginWarehouse(null);
            if (shipment.getOrder() != null) {
                shipment.getOrder().setOriginWarehouse(null);
            }
            shipment.setUpdatedAt(LocalDateTime.now());
            Shipment saved = shipmentRepository.save(shipment);
            log.info("Warehouse unassigned from shipment {}", shipment.getTrackingNumber());
            return convertToDto(saved, true);
        }

        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + warehouseId));

        if (warehouse.getStatus() != WarehouseStatus.ACTIVE) {
            throw new IllegalArgumentException("Cannot assign inactive warehouse " + warehouse.getWarehouseName() + " to shipment.");
        }

        shipment.setOriginWarehouse(warehouse);
        if (shipment.getOrder() != null) {
            shipment.getOrder().setOriginWarehouse(warehouse);
        }
        shipment.setUpdatedAt(LocalDateTime.now());

        // Create milestone tracking event
        ShipmentTrackingEvent event = new ShipmentTrackingEvent(
                shipment,
                shipment.getStatus(),
                "Assigned to Origin Warehouse: " + warehouse.getWarehouseName(),
                warehouse.getCity(),
                "Shipment assigned to origin warehouse " + warehouse.getWarehouseCode() + " (" + warehouse.getWarehouseName() + ") for warehouse operations."
        );
        eventRepository.save(event);

        Shipment saved = shipmentRepository.save(shipment);
        log.info("Shipment {} assigned to origin warehouse {} ({})", shipment.getTrackingNumber(), warehouse.getWarehouseCode(), warehouse.getWarehouseName());
        return convertToDto(saved, true);
    }

'@
    $adminShipmentServiceCode = $adminShipmentServiceCode.Replace(
        "    // ==========================================`n    // DTO CONVERTERS",
        $assignWarehouseMethod + "    // ==========================================`n    // DTO CONVERTERS"
    )

    # In convertToDto, populate warehouse fields
    $adminShipmentServiceCode = $adminShipmentServiceCode.Replace(
        "        dto.setTrackingNumber(s.getTrackingNumber());",
        "        dto.setTrackingNumber(s.getTrackingNumber());`n        dto.setShipmentNumber(s.getTrackingNumber());`n        if (s.getOriginWarehouse() != null) {`n            dto.setWarehouseId(s.getOriginWarehouse().getId());`n            dto.setWarehouseCode(s.getOriginWarehouse().getWarehouseCode());`n            dto.setWarehouseName(s.getOriginWarehouse().getWarehouseName());`n        }"
    )

    [System.IO.File]::WriteAllText($adminShipmentServicePath, $adminShipmentServiceCode, $utf8WithoutBom)
    Write-Host "[5/8] Updated AdminShipmentService.java" -ForegroundColor Green
} else {
    Write-Host "[5/8] AdminShipmentService.java already has assignWarehouse" -ForegroundColor Yellow
}

# 6. Update AdminShipmentController.java
$adminShipmentControllerPath = "$backendBase\controller\AdminShipmentController.java"
$adminShipmentControllerCode = [System.IO.File]::ReadAllText($adminShipmentControllerPath, [System.Text.Encoding]::UTF8)

if (-not $adminShipmentControllerCode.Contains("assignWarehouse(")) {
    $adminEndpointCode = @'
    @PutMapping("/{id}/warehouse")
    public ResponseEntity<ApiResponse<AdminShipmentDTO>> assignWarehouse(
            @PathVariable Long id,
            @Valid @RequestBody AssignWarehouseRequest request) {
        AdminShipmentDTO updated = adminShipmentService.assignWarehouse(id, request.getWarehouseId());
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Warehouse assignment updated successfully", updated)
        );
    }

    @PatchMapping("/{id}/warehouse")
    public ResponseEntity<ApiResponse<AdminShipmentDTO>> patchWarehouse(
            @PathVariable Long id,
            @Valid @RequestBody AssignWarehouseRequest request) {
        AdminShipmentDTO updated = adminShipmentService.assignWarehouse(id, request.getWarehouseId());
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Warehouse assignment updated successfully", updated)
        );
    }

'@
    $adminShipmentControllerCode = $adminShipmentControllerCode.Replace(
        "    @PutMapping(\"/{id}/status\")",
        $adminEndpointCode + "    @PutMapping(\"/{id}/status\")"
    )
    [System.IO.File]::WriteAllText($adminShipmentControllerPath, $adminShipmentControllerCode, $utf8WithoutBom)
    Write-Host "[6/8] Updated AdminShipmentController.java" -ForegroundColor Green
} else {
    Write-Host "[6/8] AdminShipmentController.java already has assignWarehouse" -ForegroundColor Yellow
}

# 7. Update WarehouseManagerService.java & WarehouseManagerController.java
$wmServicePath = "$backendBase\service\WarehouseManagerService.java"
$wmServiceCode = [System.IO.File]::ReadAllText($wmServicePath, [System.Text.Encoding]::UTF8)

if (-not $wmServiceCode.Contains("getAllWarehouseShipments()")) {
    $allWhShipmentsMethod = @'
    @Transactional(readOnly = true)
    public List<WarehouseShipmentDTO> getAllWarehouseShipments() {
        Warehouse warehouse = getScopedWarehouse();
        List<Shipment> list = shipmentRepository.findByOriginWarehouseOrderByCreatedAtDesc(warehouse);
        return list.stream().map(this::mapToShipmentDTO).collect(Collectors.toList());
    }

'@
    $wmServiceCode = $wmServiceCode.Replace(
        "    @Transactional(readOnly = true)`n    public List<WarehouseShipmentDTO> getOutgoingShipments() {",
        $allWhShipmentsMethod + "    @Transactional(readOnly = true)`n    public List<WarehouseShipmentDTO> getOutgoingShipments() {"
    )

    # In mapToShipmentDTO, map customer and warehouse fields
    $mapTarget = "        dto.setOperationalStage(s.getOperationalStage());"
    $mapReplacement = @"
        dto.setOperationalStage(s.getOperationalStage());
        dto.setShipmentNumber(s.getTrackingNumber());

        if (s.getOrder() != null && s.getOrder().getCustomer() != null) {
            User c = s.getOrder().getCustomer();
            dto.setCustomerId(c.getId());
            dto.setCustomerName(c.getFullName());
            dto.setCustomerEmail(c.getEmail());
            dto.setCustomerPhone(c.getPhone());
        }

        if (s.getOriginWarehouse() != null) {
            dto.setWarehouseCode(s.getOriginWarehouse().getWarehouseCode());
            dto.setWarehouseName(s.getOriginWarehouse().getWarehouseName());
        }
"@
    $wmServiceCode = $wmServiceCode.Replace($mapTarget, $mapReplacement)
    [System.IO.File]::WriteAllText($wmServicePath, $wmServiceCode, $utf8WithoutBom)
    Write-Host "[7/8] Updated WarehouseManagerService.java" -ForegroundColor Green
} else {
    Write-Host "[7/8] WarehouseManagerService.java already has getAllWarehouseShipments" -ForegroundColor Yellow
}

$wmControllerPath = "$backendBase\controller\WarehouseManagerController.java"
$wmControllerCode = [System.IO.File]::ReadAllText($wmControllerPath, [System.Text.Encoding]::UTF8)

if (-not $wmControllerCode.Contains('{"/api/warehouse-manager", "/api/warehouse"}')) {
    $wmControllerCode = $wmControllerCode.Replace(
        '@RequestMapping("/api/warehouse-manager")',
        '@RequestMapping({"/api/warehouse-manager", "/api/warehouse"})'
    )
}

if (-not $wmControllerCode.Contains('@GetMapping("/shipments")')) {
    $whShipmentsEndpoint = @'
    @GetMapping("/shipments")
    public ResponseEntity<ApiResponse<List<WarehouseShipmentDTO>>> getWarehouseShipments() {
        List<WarehouseShipmentDTO> shipments = warehouseManagerService.getAllWarehouseShipments();
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse shipments retrieved successfully", shipments));
    }

'@
    $wmControllerCode = $wmControllerCode.Replace(
        '    @GetMapping("/shipments/incoming")',
        $whShipmentsEndpoint + '    @GetMapping("/shipments/incoming")'
    )
    [System.IO.File]::WriteAllText($wmControllerPath, $wmControllerCode, $utf8WithoutBom)
    Write-Host "[7/8b] Updated WarehouseManagerController.java" -ForegroundColor Green
} else {
    Write-Host "[7/8b] WarehouseManagerController.java already updated" -ForegroundColor Yellow
}

# 8. Update SecurityConfig.java & GlobalExceptionHandler.java
$securityConfigPath = "$backendBase\config\SecurityConfig.java"
$securityConfigCode = [System.IO.File]::ReadAllText($securityConfigPath, [System.Text.Encoding]::UTF8)

if (-not $securityConfigCode.Contains('"/api/warehouse/**"')) {
    $securityConfigCode = $securityConfigCode.Replace(
        '.requestMatchers("/api/warehouse-manager/**")',
        '.requestMatchers("/api/warehouse-manager/**", "/api/warehouse/**")'
    )
    [System.IO.File]::WriteAllText($securityConfigPath, $securityConfigCode, $utf8WithoutBom)
    Write-Host "[8/8a] Updated SecurityConfig.java" -ForegroundColor Green
} else {
    Write-Host "[8/8a] SecurityConfig.java already includes /api/warehouse/**" -ForegroundColor Yellow
}

$exceptionHandlerPath = "$backendBase\exception\GlobalExceptionHandler.java"
$exceptionHandlerCode = [System.IO.File]::ReadAllText($exceptionHandlerPath, [System.Text.Encoding]::UTF8)

if (-not $exceptionHandlerCode.Contains("handleAccessDenied(")) {
    $accessDeniedMethod = @'
    // ==========================================
    // ACCESS DENIED / FORBIDDEN - 403
    // ==========================================

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(
            org.springframework.security.access.AccessDeniedException exception) {

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", exception.getMessage() != null ? exception.getMessage() : "Access denied.");
        response.put("status", HttpStatus.FORBIDDEN.value());
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(response);
    }

'@
    $exceptionHandlerCode = $exceptionHandlerCode.Replace(
        "    // ==========================================`n    // RESOURCE NOT FOUND - 404",
        $accessDeniedMethod + "    // ==========================================`n    // RESOURCE NOT FOUND - 404"
    )
    [System.IO.File]::WriteAllText($exceptionHandlerPath, $exceptionHandlerCode, $utf8WithoutBom)
    Write-Host "[8/8b] Updated GlobalExceptionHandler.java" -ForegroundColor Green
} else {
    Write-Host "[8/8b] GlobalExceptionHandler.java already has handleAccessDenied" -ForegroundColor Yellow
}

Write-Host "All Step 3 backend files applied successfully!" -ForegroundColor Green
