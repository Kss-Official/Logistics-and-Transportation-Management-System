const fs = require('fs');
const path = require('path');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

// 1. Fix AdminShipmentService.java
let adminContent = fs.readFileSync(path.join(BACKEND_BASE, "service/AdminShipmentService.java"), 'utf8');

if (!adminContent.includes("public AdminShipmentDTO assignWarehouse(")) {
  const assignWarehouseMethod = `
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
`;

  // Find DTO CONVERTERS header regardless of \r\n or \n
  const marker = "// DTO CONVERTERS";
  const pos = adminContent.indexOf(marker);
  if (pos !== -1) {
    // Find the beginning of the comment box before DTO CONVERTERS
    const boxStart = adminContent.lastIndexOf("    // ==========================================", pos);
    if (boxStart !== -1) {
      adminContent = adminContent.substring(0, boxStart) + assignWarehouseMethod + "\n" + adminContent.substring(boxStart);
      fs.writeFileSync(path.join(BACKEND_BASE, "service/AdminShipmentService.java"), adminContent, 'utf8');
      console.log("Successfully inserted assignWarehouse into AdminShipmentService.java");
    } else {
      console.error("Could not find boxStart before DTO CONVERTERS");
    }
  } else {
    console.error("Could not find marker DTO CONVERTERS");
  }
}

// 2. Fix GlobalExceptionHandler.java
let handlerContent = fs.readFileSync(path.join(BACKEND_BASE, "exception/GlobalExceptionHandler.java"), 'utf8');
if (!handlerContent.includes("handleAccessDenied(")) {
  const accessDeniedMethod = `
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
`;

  const marker = "// RESOURCE NOT FOUND - 404";
  const pos = handlerContent.indexOf(marker);
  if (pos !== -1) {
    const boxStart = handlerContent.lastIndexOf("    // ==========================================", pos);
    if (boxStart !== -1) {
      handlerContent = handlerContent.substring(0, boxStart) + accessDeniedMethod + "\n" + handlerContent.substring(boxStart);
      fs.writeFileSync(path.join(BACKEND_BASE, "exception/GlobalExceptionHandler.java"), handlerContent, 'utf8');
      console.log("Successfully inserted handleAccessDenied into GlobalExceptionHandler.java");
    } else {
      console.error("Could not find boxStart before RESOURCE NOT FOUND");
    }
  } else {
    console.error("Could not find marker RESOURCE NOT FOUND - 404");
  }
}
