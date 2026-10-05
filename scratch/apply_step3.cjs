const fs = require('fs');
const path = require('path');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

function read(relPath) {
  return fs.readFileSync(path.join(BACKEND_BASE, relPath), 'utf8');
}

function write(relPath, content) {
  fs.writeFileSync(path.join(BACKEND_BASE, relPath), content, 'utf8');
}

console.log("=== APPLYING STEP 3 BACKEND CHANGES VIA NODE ===");

// 1. AssignWarehouseRequest.java
const assignWarehouseRequestPath = path.join(BACKEND_BASE, "dto", "AssignWarehouseRequest.java");
const assignWarehouseRequestContent = `package com.primeroute.logistics.dto;

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
`;
fs.writeFileSync(assignWarehouseRequestPath, assignWarehouseRequestContent, 'utf8');
console.log("[1/8] Created AssignWarehouseRequest.java");

// 2. AdminShipmentDTO.java
let adminShipmentDTO = read("dto/AdminShipmentDTO.java");
if (!adminShipmentDTO.includes("private Long warehouseId;")) {
  adminShipmentDTO = adminShipmentDTO.replace(
    "    private String currentLocation;",
    `    private String currentLocation;\n\n    // Warehouse details\n    private String shipmentNumber;\n    private Long warehouseId;\n    private String warehouseCode;\n    private String warehouseName;`
  );

  adminShipmentDTO = adminShipmentDTO.replace(
    "    public List<AdminShipmentTrackingEventDTO> getEvents() { return events; }",
    `    public String getShipmentNumber() { return shipmentNumber != null ? shipmentNumber : trackingNumber; }\n    public void setShipmentNumber(String shipmentNumber) { this.shipmentNumber = shipmentNumber; }\n\n    public Long getWarehouseId() { return warehouseId; }\n    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }\n\n    public String getWarehouseCode() { return warehouseCode; }\n    public void setWarehouseCode(String warehouseCode) { this.warehouseCode = warehouseCode; }\n\n    public String getWarehouseName() { return warehouseName; }\n    public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }\n\n    public List<AdminShipmentTrackingEventDTO> getEvents() { return events; }`
  );
  write("dto/AdminShipmentDTO.java", adminShipmentDTO);
  console.log("[2/8] Updated AdminShipmentDTO.java");
} else {
  console.log("[2/8] AdminShipmentDTO.java already updated");
}

// 3. WarehouseShipmentDTO.java
let whShipmentDTO = read("dto/warehouse/WarehouseShipmentDTO.java");
if (!whShipmentDTO.includes("private String shipmentNumber;")) {
  whShipmentDTO = whShipmentDTO.replace(
    "    private String operationalStage;",
    `    private String operationalStage;\n    private String shipmentNumber;\n    private String warehouseCode;\n    private String warehouseName;\n\n    // Customer details\n    private Long customerId;\n    private String customerName;\n    private String customerEmail;\n    private String customerPhone;`
  );

  whShipmentDTO = whShipmentDTO.replace(
    "    public Long getId() { return id; }",
    `    public String getShipmentNumber() { return shipmentNumber != null ? shipmentNumber : trackingNumber; }\n    public void setShipmentNumber(String shipmentNumber) { this.shipmentNumber = shipmentNumber; }\n\n    public String getWarehouseCode() { return warehouseCode; }\n    public void setWarehouseCode(String warehouseCode) { this.warehouseCode = warehouseCode; }\n\n    public String getWarehouseName() { return warehouseName; }\n    public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }\n\n    public Long getCustomerId() { return customerId; }\n    public void setCustomerId(Long customerId) { this.customerId = customerId; }\n\n    public String getCustomerName() { return customerName; }\n    public void setCustomerName(String customerName) { this.customerName = customerName; }\n\n    public String getCustomerEmail() { return customerEmail; }\n    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }\n\n    public String getCustomerPhone() { return customerPhone; }\n    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }\n\n    public Long getId() { return id; }`
  );
  write("dto/warehouse/WarehouseShipmentDTO.java", whShipmentDTO);
  console.log("[3/8] Updated WarehouseShipmentDTO.java");
} else {
  console.log("[3/8] WarehouseShipmentDTO.java already updated");
}

// 4. ShipmentRepository.java
let shipmentRepo = read("repository/ShipmentRepository.java");
if (!shipmentRepo.includes("LEFT JOIN FETCH s.originWarehouse ow")) {
  shipmentRepo = shipmentRepo.replace(
    '"LEFT JOIN FETCH s.vehicle v " +',
    '"LEFT JOIN FETCH s.vehicle v " +\n           "LEFT JOIN FETCH s.originWarehouse ow " +'
  );
  write("repository/ShipmentRepository.java", shipmentRepo);
  console.log("[4/8] Updated ShipmentRepository.java");
} else {
  console.log("[4/8] ShipmentRepository.java already updated");
}

// 5. AdminShipmentService.java
let adminShipmentService = read("service/AdminShipmentService.java");
if (!adminShipmentService.includes("public AdminShipmentDTO assignWarehouse(")) {
  if (!adminShipmentService.includes("import com.primeroute.logistics.repository.WarehouseRepository;")) {
    adminShipmentService = adminShipmentService.replace(
      "import com.primeroute.logistics.repository.VehicleRepository;",
      "import com.primeroute.logistics.repository.VehicleRepository;\nimport com.primeroute.logistics.repository.WarehouseRepository;"
    );
  }

  adminShipmentService = adminShipmentService.replace(
    "    private final GeocodingService geocodingService;",
    "    private final GeocodingService geocodingService;\n    private final WarehouseRepository warehouseRepository;"
  );

  adminShipmentService = adminShipmentService.replace(
    "            GeocodingService geocodingService) {",
    "            GeocodingService geocodingService,\n            WarehouseRepository warehouseRepository) {"
  );

  adminShipmentService = adminShipmentService.replace(
    "        this.geocodingService = geocodingService;",
    "        this.geocodingService = geocodingService;\n        this.warehouseRepository = warehouseRepository;"
  );

  const assignWarehouseMethod = `    // ==========================================
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

`;

  adminShipmentService = adminShipmentService.replace(
    "    // ==========================================\n    // DTO CONVERTERS",
    assignWarehouseMethod + "    // ==========================================\n    // DTO CONVERTERS"
  );

  adminShipmentService = adminShipmentService.replace(
    "        dto.setTrackingNumber(s.getTrackingNumber());",
    `        dto.setTrackingNumber(s.getTrackingNumber());\n        dto.setShipmentNumber(s.getTrackingNumber());\n        if (s.getOriginWarehouse() != null) {\n            dto.setWarehouseId(s.getOriginWarehouse().getId());\n            dto.setWarehouseCode(s.getOriginWarehouse().getWarehouseCode());\n            dto.setWarehouseName(s.getOriginWarehouse().getWarehouseName());\n        }`
  );

  write("service/AdminShipmentService.java", adminShipmentService);
  console.log("[5/8] Updated AdminShipmentService.java");
} else {
  console.log("[5/8] AdminShipmentService.java already updated");
}

// 6. AdminShipmentController.java
let adminShipmentController = read("controller/AdminShipmentController.java");
if (!adminShipmentController.includes("assignWarehouse(")) {
  const adminEndpoints = `    @PutMapping("/{id}/warehouse")
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

`;

  adminShipmentController = adminShipmentController.replace(
    '    @PutMapping("/{id}/status")',
    adminEndpoints + '    @PutMapping("/{id}/status")'
  );
  write("controller/AdminShipmentController.java", adminShipmentController);
  console.log("[6/8] Updated AdminShipmentController.java");
} else {
  console.log("[6/8] AdminShipmentController.java already updated");
}

// 7. WarehouseManagerService.java & WarehouseManagerController.java
let wmService = read("service/WarehouseManagerService.java");
if (!wmService.includes("public List<WarehouseShipmentDTO> getAllWarehouseShipments()")) {
  const allWhShipmentsMethod = `    @Transactional(readOnly = true)
    public List<WarehouseShipmentDTO> getAllWarehouseShipments() {
        Warehouse warehouse = getScopedWarehouse();
        List<Shipment> list = shipmentRepository.findByOriginWarehouseOrderByCreatedAtDesc(warehouse);
        return list.stream().map(this::mapToShipmentDTO).collect(Collectors.toList());
    }

`;

  wmService = wmService.replace(
    "    @Transactional(readOnly = true)\n    public List<WarehouseShipmentDTO> getOutgoingShipments() {",
    allWhShipmentsMethod + "    @Transactional(readOnly = true)\n    public List<WarehouseShipmentDTO> getOutgoingShipments() {"
  );

  wmService = wmService.replace(
    "        dto.setOperationalStage(s.getOperationalStage());",
    `        dto.setOperationalStage(s.getOperationalStage());\n        dto.setShipmentNumber(s.getTrackingNumber());\n\n        if (s.getOrder() != null && s.getOrder().getCustomer() != null) {\n            User c = s.getOrder().getCustomer();\n            dto.setCustomerId(c.getId());\n            dto.setCustomerName(c.getFullName());\n            dto.setCustomerEmail(c.getEmail());\n            dto.setCustomerPhone(c.getPhone());\n        }\n\n        if (s.getOriginWarehouse() != null) {\n            dto.setWarehouseCode(s.getOriginWarehouse().getWarehouseCode());\n            dto.setWarehouseName(s.getOriginWarehouse().getWarehouseName());\n        }`
  );

  write("service/WarehouseManagerService.java", wmService);
  console.log("[7/8a] Updated WarehouseManagerService.java");
} else {
  console.log("[7/8a] WarehouseManagerService.java already updated");
}

let wmController = read("controller/WarehouseManagerController.java");
if (!wmController.includes('{"/api/warehouse-manager", "/api/warehouse"}')) {
  wmController = wmController.replace(
    '@RequestMapping("/api/warehouse-manager")',
    '@RequestMapping({"/api/warehouse-manager", "/api/warehouse"})'
  );
}

if (!wmController.includes('@GetMapping("/shipments")')) {
  const whShipmentsEndpoint = `    @GetMapping("/shipments")
    public ResponseEntity<ApiResponse<List<WarehouseShipmentDTO>>> getWarehouseShipments() {
        List<WarehouseShipmentDTO> shipments = warehouseManagerService.getAllWarehouseShipments();
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse shipments retrieved successfully", shipments));
    }

`;

  wmController = wmController.replace(
    '    @GetMapping("/shipments/incoming")',
    whShipmentsEndpoint + '    @GetMapping("/shipments/incoming")'
  );
  write("controller/WarehouseManagerController.java", wmController);
  console.log("[7/8b] Updated WarehouseManagerController.java");
} else {
  console.log("[7/8b] WarehouseManagerController.java already updated");
}

// 8. SecurityConfig.java & GlobalExceptionHandler.java
let securityConfig = read("config/SecurityConfig.java");
if (!securityConfig.includes('"/api/warehouse/**"')) {
  securityConfig = securityConfig.replace(
    '.requestMatchers("/api/warehouse-manager/**")',
    '.requestMatchers("/api/warehouse-manager/**", "/api/warehouse/**")'
  );
  write("config/SecurityConfig.java", securityConfig);
  console.log("[8/8a] Updated SecurityConfig.java");
} else {
  console.log("[8/8a] SecurityConfig.java already updated");
}

let exceptionHandler = read("exception/GlobalExceptionHandler.java");
if (!exceptionHandler.includes("handleAccessDenied(")) {
  const accessDeniedMethod = `    // ==========================================
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

`;

  exceptionHandler = exceptionHandler.replace(
    "    // ==========================================\n    // RESOURCE NOT FOUND - 404",
    accessDeniedMethod + "    // ==========================================\n    // RESOURCE NOT FOUND - 404"
  );
  write("exception/GlobalExceptionHandler.java", exceptionHandler);
  console.log("[8/8b] Updated GlobalExceptionHandler.java");
} else {
  console.log("[8/8b] GlobalExceptionHandler.java already updated");
}

console.log("=== ALL STEP 3 FILES APPLIED SUCCESSFULLY ===");
