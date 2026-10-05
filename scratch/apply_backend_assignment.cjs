const fs = require('fs');
const path = require('path');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

function read(rel) {
  return fs.readFileSync(path.join(BACKEND_BASE, rel), 'utf8');
}

function write(rel, content) {
  fs.writeFileSync(path.join(BACKEND_BASE, rel), content, 'utf8');
}

console.log("=== APPLYING BACKEND ASSIGNMENT & OVERRIDE RULES ===");

// 1. AdminOverrideAssignmentRequest.java
const overrideReqPath = path.join(BACKEND_BASE, "dto", "AdminOverrideAssignmentRequest.java");
const overrideReqCode = `package com.primeroute.logistics.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AdminOverrideAssignmentRequest {

    @NotNull(message = "Driver ID is required")
    private Long driverId;

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotBlank(message = "Override reason is mandatory")
    private String reason;

    public AdminOverrideAssignmentRequest() {}

    public AdminOverrideAssignmentRequest(Long driverId, Long vehicleId, String reason) {
        this.driverId = driverId;
        this.vehicleId = vehicleId;
        this.reason = reason;
    }

    public Long getDriverId() {
        return driverId;
    }

    public void setDriverId(Long driverId) {
        this.driverId = driverId;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
`;
fs.writeFileSync(overrideReqPath, overrideReqCode, 'utf8');
console.log("[1/6] Created AdminOverrideAssignmentRequest.java");

// 2. Shipment.java - add assigned_by, assigned_at, assignment_status
let shipmentCode = read("entity/Shipment.java");
if (!shipmentCode.includes("private String assignedBy;")) {
  shipmentCode = shipmentCode.replace(
    "    @Column(name = \"operational_stage\")\n    private String operationalStage = \"READY_FOR_PROCESSING\";",
    `    @Column(name = "operational_stage")\n    private String operationalStage = "READY_FOR_PROCESSING";\n\n    @Column(name = "assigned_by")\n    private String assignedBy;\n\n    @Column(name = "assigned_at")\n    private LocalDateTime assignedAt;\n\n    @Column(name = "assignment_status")\n    private String assignmentStatus;`
  );

  const gettersAndSetters = `
    public String getAssignedBy() {
        return assignedBy;
    }

    public void setAssignedBy(String assignedBy) {
        this.assignedBy = assignedBy;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public String getAssignmentStatus() {
        return assignmentStatus;
    }

    public void setAssignmentStatus(String assignmentStatus) {
        this.assignmentStatus = assignmentStatus;
    }
`;
  const endIdx = shipmentCode.lastIndexOf("}");
  shipmentCode = shipmentCode.substring(0, endIdx) + gettersAndSetters + "\n}\n";
  write("entity/Shipment.java", shipmentCode);
  console.log("[2/6] Updated Shipment.java with assignedBy, assignedAt, assignmentStatus");
} else {
  console.log("[2/6] Shipment.java already has assignment fields");
}

// 3. AdminShipmentDTO.java
let adminDtoCode = read("dto/AdminShipmentDTO.java");
if (!adminDtoCode.includes("private String assignmentStatus;")) {
  adminDtoCode = adminDtoCode.replace(
    "    private String warehouseName;",
    `    private String warehouseName;\n\n    // Assignment Audit\n    private String assignmentStatus;\n    private String assignedBy;\n    private LocalDateTime assignedAt;`
  );

  adminDtoCode = adminDtoCode.replace(
    "    public String getWarehouseName() { return warehouseName; }",
    `    public String getWarehouseName() { return warehouseName; }\n\n    public String getAssignmentStatus() { return assignmentStatus; }\n    public void setAssignmentStatus(String assignmentStatus) { this.assignmentStatus = assignmentStatus; }\n\n    public String getAssignedBy() { return assignedBy; }\n    public void setAssignedBy(String assignedBy) { this.assignedBy = assignedBy; }\n\n    public LocalDateTime getAssignedAt() { return assignedAt; }\n    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }`
  );
  write("dto/AdminShipmentDTO.java", adminDtoCode);
  console.log("[3/6] Updated AdminShipmentDTO.java with assignment status & audit fields");
} else {
  console.log("[3/6] AdminShipmentDTO.java already updated");
}

// 4. WarehouseShipmentDTO.java
let wmDtoCode = read("dto/warehouse/WarehouseShipmentDTO.java");
if (!wmDtoCode.includes("private String assignmentStatus;")) {
  wmDtoCode = wmDtoCode.replace(
    "    private String warehouseName;",
    `    private String warehouseName;\n    private String assignmentStatus;\n    private String assignedBy;\n    private LocalDateTime assignedAt;`
  );

  wmDtoCode = wmDtoCode.replace(
    "    public String getWarehouseName() { return warehouseName; }",
    `    public String getWarehouseName() { return warehouseName; }\n\n    public String getAssignmentStatus() { return assignmentStatus; }\n    public void setAssignmentStatus(String assignmentStatus) { this.assignmentStatus = assignmentStatus; }\n\n    public String getAssignedBy() { return assignedBy; }\n    public void setAssignedBy(String assignedBy) { this.assignedBy = assignedBy; }\n\n    public LocalDateTime getAssignedAt() { return assignedAt; }\n    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }`
  );
  write("dto/warehouse/WarehouseShipmentDTO.java", wmDtoCode);
  console.log("[4/6] Updated WarehouseShipmentDTO.java with assignment status & audit fields");
} else {
  console.log("[4/6] WarehouseShipmentDTO.java already updated");
}

// 5. AdminShipmentService.java & AdminShipmentController.java
let adminServiceCode = read("service/AdminShipmentService.java");
if (!adminServiceCode.includes("public AdminShipmentDTO overrideAssignment(")) {
  const overrideMethod = `
    // ==========================================
    // 4D. ADMIN OVERRIDE FLEET ASSIGNMENT
    // ==========================================
    public AdminShipmentDTO overrideAssignment(Long shipmentId, AdminOverrideAssignmentRequest request) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + shipmentId));

        if (request.getReason() == null || request.getReason().trim().isEmpty()) {
            throw new IllegalArgumentException("Override reason is mandatory for administrator fleet reassignment.");
        }

        if (request.getDriverId() == null) {
            throw new IllegalArgumentException("Driver ID is required for fleet assignment override.");
        }
        if (request.getVehicleId() == null) {
            throw new IllegalArgumentException("Vehicle ID is required for fleet assignment override.");
        }

        Driver driver = driverRepository.findById(request.getDriverId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + request.getDriverId()));

        if (driver.getStatus() == DriverStatus.INACTIVE) {
            throw new IllegalArgumentException("Cannot assign inactive driver " + driver.getFullName() + ".");
        }

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + request.getVehicleId()));

        if (vehicle.getStatus() == VehicleStatus.INACTIVE) {
            throw new IllegalArgumentException("Cannot assign inactive vehicle " + vehicle.getVehicleNumber() + ".");
        }
        if (vehicle.getStatus() == VehicleStatus.MAINTENANCE) {
            throw new IllegalArgumentException("Cannot assign vehicle " + vehicle.getVehicleNumber() + " undergoing maintenance.");
        }

        // Validate vehicle assigned driver match
        if (vehicle.getAssignedDriver() != null && !vehicle.getAssignedDriver().getId().equals(driver.getId())) {
            throw new IllegalArgumentException("Vehicle " + vehicle.getVehicleNumber() + " is configured for driver " + vehicle.getAssignedDriver().getFullName() + " and cannot be assigned to another driver.");
        }

        // Active shipment checks
        List<Shipment> activeOnDriver = shipmentRepository.findActiveShipmentsByDriver(driver);
        boolean driverHasOther = activeOnDriver.stream().anyMatch(s -> !s.getId().equals(shipmentId));
        if (driverHasOther) {
            Shipment other = activeOnDriver.stream().filter(s -> !s.getId().equals(shipmentId)).findFirst().get();
            throw new IllegalArgumentException("Driver " + driver.getFullName() + " is currently on trip with shipment " + other.getTrackingNumber() + ".");
        }

        List<Shipment> activeOnVeh = shipmentRepository.findActiveShipmentsByVehicle(vehicle);
        boolean vehHasOther = activeOnVeh.stream().anyMatch(s -> !s.getId().equals(shipmentId));
        if (vehHasOther) {
            Shipment other = activeOnVeh.stream().filter(s -> !s.getId().equals(shipmentId)).findFirst().get();
            throw new IllegalArgumentException("Vehicle " + vehicle.getVehicleNumber() + " is currently assigned to active shipment " + other.getTrackingNumber() + ".");
        }

        // Reclaim previous driver if different
        Driver prevDriver = shipment.getDriver();
        if (prevDriver != null && !prevDriver.getId().equals(driver.getId())) {
            List<Shipment> otherDriverShipments = shipmentRepository.findActiveShipmentsByDriver(prevDriver);
            boolean prevDriverHasOther = otherDriverShipments.stream().anyMatch(s -> !s.getId().equals(shipmentId));
            if (!prevDriverHasOther && prevDriver.getStatus() != DriverStatus.INACTIVE) {
                prevDriver.setStatus(DriverStatus.AVAILABLE);
                driverRepository.save(prevDriver);
            }
        }

        // Reclaim previous vehicle if different
        Vehicle prevVehicle = shipment.getVehicle();
        if (prevVehicle != null && !prevVehicle.getId().equals(vehicle.getId())) {
            List<Shipment> otherVehShipments = shipmentRepository.findActiveShipmentsByVehicle(prevVehicle);
            boolean prevVehHasOther = otherVehShipments.stream().anyMatch(s -> !s.getId().equals(shipmentId));
            if (!prevVehHasOther && prevVehicle.getStatus() != VehicleStatus.INACTIVE && prevVehicle.getStatus() != VehicleStatus.MAINTENANCE) {
                prevVehicle.setStatus(prevVehicle.getAssignedDriver() != null ? VehicleStatus.ASSIGNED : VehicleStatus.AVAILABLE);
                vehicleRepository.save(prevVehicle);
            }
        }

        // Apply new assignment
        shipment.setDriver(driver);
        shipment.setVehicle(vehicle);
        shipment.setAssignedBy("Admin Override");
        shipment.setAssignedAt(LocalDateTime.now());
        shipment.setAssignmentStatus("ASSIGNED");
        shipment.setUpdatedAt(LocalDateTime.now());

        driver.setStatus(DriverStatus.ON_TRIP);
        driverRepository.save(driver);

        vehicle.setStatus(VehicleStatus.ASSIGNED);
        vehicleRepository.save(vehicle);

        // Record tracking milestone event
        String prevDriverName = prevDriver != null ? prevDriver.getFullName() : "None";
        String prevVehNumber = prevVehicle != null ? prevVehicle.getVehicleNumber() : "None";
        String description = "Fleet Reassignment Override by Administrator. Previous: Driver [" + prevDriverName + "], Vehicle [" + prevVehNumber + "] -> New: Driver [" + driver.getFullName() + "], Vehicle [" + vehicle.getVehicleNumber() + "]. Reason: " + request.getReason().trim();

        ShipmentTrackingEvent event = new ShipmentTrackingEvent(
                shipment,
                shipment.getStatus(),
                "Fleet Assignment Overridden by Admin",
                shipment.getOriginWarehouse() != null ? shipment.getOriginWarehouse().getWarehouseName() : "Admin Operations Hub",
                description
        );
        eventRepository.save(event);

        Shipment saved = shipmentRepository.save(shipment);
        log.info("Shipment {} fleet overridden by Admin: Driver={}, Vehicle={}, Reason={}", shipment.getTrackingNumber(), driver.getFullName(), vehicle.getVehicleNumber(), request.getReason());
        return convertToDto(saved, true);
    }
`;

  const marker = "// DTO CONVERTERS";
  const pos = adminServiceCode.indexOf(marker);
  const boxStart = adminServiceCode.lastIndexOf("    // ==========================================", pos);
  adminServiceCode = adminServiceCode.substring(0, boxStart) + overrideMethod + "\n" + adminServiceCode.substring(boxStart);

  // Update convertToDto to map assignment fields
  const convertTarget = "        Order order = s.getOrder();";
  const convertReplacement = `        // Assignment Status & Audit
        if (s.getDriver() != null && s.getVehicle() != null) {
            dto.setAssignmentStatus(s.getAssignmentStatus() != null ? s.getAssignmentStatus() : "ASSIGNED");
            dto.setAssignedBy(s.getAssignedBy() != null ? s.getAssignedBy() : "Warehouse Manager");
            dto.setAssignedAt(s.getAssignedAt() != null ? s.getAssignedAt() : s.getUpdatedAt());
        } else {
            dto.setAssignmentStatus("Awaiting Warehouse Assignment");
            dto.setAssignedBy("Not Assigned");
            dto.setAssignedAt(null);
        }

        Order order = s.getOrder();`;
  adminServiceCode = adminServiceCode.replace(convertTarget, convertReplacement);

  write("service/AdminShipmentService.java", adminServiceCode);
  console.log("[5/6a] Updated AdminShipmentService.java with overrideAssignment and DTO mapping");
} else {
  console.log("[5/6a] AdminShipmentService.java already has overrideAssignment");
}

let adminControllerCode = read("controller/AdminShipmentController.java");
if (!adminControllerCode.includes("overrideAssignment(")) {
  const overrideEndpoint = `    @PostMapping("/{id}/override-assignment")
    public ResponseEntity<ApiResponse<AdminShipmentDTO>> overrideAssignment(
            @PathVariable Long id,
            @Valid @RequestBody AdminOverrideAssignmentRequest request) {
        AdminShipmentDTO updated = adminShipmentService.overrideAssignment(id, request);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Fleet assignment overridden successfully", updated)
        );
    }

`;
  adminControllerCode = adminControllerCode.replace(
    '    @PutMapping("/{id}/status")',
    overrideEndpoint + '    @PutMapping("/{id}/status")'
  );
  write("controller/AdminShipmentController.java", adminControllerCode);
  console.log("[5/6b] Updated AdminShipmentController.java with POST /{id}/override-assignment");
} else {
  console.log("[5/6b] AdminShipmentController.java already has overrideAssignment");
}

// 6. WarehouseManagerService.java - role restriction on normal assignment & assignment audit
let wmServiceCode = read("service/WarehouseManagerService.java");

// In assignFleet, enforce role check: only WAREHOUSE_MANAGER can assign fleet
const assignFleetTarget = `        Warehouse warehouse = getScopedWarehouse();
        User user = getAuthenticatedUser();
        String performer = user != null && user.getFullName() != null ? user.getFullName() : "Warehouse Manager";`;

const assignFleetReplacement = `        User user = getAuthenticatedUser();
        if (user == null || user.getRole() != Role.WAREHOUSE_MANAGER) {
            throw new AccessDeniedException("Only Warehouse Managers can perform standard operational fleet assignments. Administrators must use the Admin Override Assignment API.");
        }
        Warehouse warehouse = getScopedWarehouse();
        String performer = "Warehouse Manager (" + user.getFullName() + ")";`;

if (wmServiceCode.includes(assignFleetTarget)) {
  wmServiceCode = wmServiceCode.replace(assignFleetTarget, assignFleetReplacement);

  // Set assignedBy, assignedAt, assignmentStatus on shipment before save
  const saveTarget = "        shipment.setUpdatedAt(LocalDateTime.now());\n        Shipment saved = shipmentRepository.save(shipment);";
  const saveReplacement = `        shipment.setAssignedBy(performer);
        shipment.setAssignedAt(LocalDateTime.now());
        shipment.setAssignmentStatus("ASSIGNED");
        shipment.setUpdatedAt(LocalDateTime.now());
        Shipment saved = shipmentRepository.save(shipment);`;
  wmServiceCode = wmServiceCode.replace(saveTarget, saveReplacement);

  // In mapToShipmentDTO, map assignment status
  const mapTarget = "        dto.setOperationalStage(s.getOperationalStage());";
  const mapReplacement = `        dto.setOperationalStage(s.getOperationalStage());
        if (s.getDriver() != null && s.getVehicle() != null) {
            dto.setAssignmentStatus(s.getAssignmentStatus() != null ? s.getAssignmentStatus() : "ASSIGNED");
            dto.setAssignedBy(s.getAssignedBy() != null ? s.getAssignedBy() : "Warehouse Manager");
            dto.setAssignedAt(s.getAssignedAt() != null ? s.getAssignedAt() : s.getUpdatedAt());
        } else {
            dto.setAssignmentStatus("Awaiting Warehouse Assignment");
            dto.setAssignedBy("Not Assigned");
            dto.setAssignedAt(null);
        }`;
  wmServiceCode = wmServiceCode.replace(mapTarget, mapReplacement);

  write("service/WarehouseManagerService.java", wmServiceCode);
  console.log("[6/6] Updated WarehouseManagerService.java with role protection and assignment audit fields");
} else {
  console.log("[6/6] WarehouseManagerService.java assignFleet already updated or pattern did not match directly");
}

console.log("=== ALL BACKEND UPDATES APPLIED ===");
