const fs = require('fs');
const path = require('path');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

function read(rel) {
  return fs.readFileSync(path.join(BACKEND_BASE, rel), 'utf8');
}

function write(rel, content) {
  fs.writeFileSync(path.join(BACKEND_BASE, rel), content, 'utf8');
}

console.log("=== APPLYING ORDER -> SHIPMENT BACKEND UPDATES ===");

// 1. Update AdminCreateShipmentRequest.java
const reqFile = "dto/AdminCreateShipmentRequest.java";
const newReqCode = `package com.primeroute.logistics.dto;

import jakarta.validation.constraints.NotNull;

public class AdminCreateShipmentRequest {

    @NotNull(message = "Order ID is required to create a shipment")
    private Long orderId;

    @NotNull(message = "Fulfillment warehouse ID is required")
    private Long warehouseId;

    public AdminCreateShipmentRequest() {}

    public AdminCreateShipmentRequest(Long orderId, Long warehouseId) {
        this.orderId = orderId;
        this.warehouseId = warehouseId;
    }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }
}
`;
write(reqFile, newReqCode);
console.log("[1/4] Updated AdminCreateShipmentRequest.java (orderId, warehouseId)");

// 2. Update AdminShipmentDTO.java (add warehouseManagerName, warehouseManagerEmail)
const dtoFile = "dto/AdminShipmentDTO.java";
let dtoCode = read(dtoFile);
if (!dtoCode.includes("warehouseManagerName")) {
  dtoCode = dtoCode.replace(
    '    private String warehouseName;\n',
    '    private String warehouseName;\n    private String warehouseManagerName;\n    private String warehouseManagerEmail;\n'
  );
  dtoCode = dtoCode.replace(
    '    public String getWarehouseName() { return warehouseName; }\n',
    `    public String getWarehouseName() { return warehouseName; }\n    public String getWarehouseManagerName() { return warehouseManagerName; }\n    public void setWarehouseManagerName(String warehouseManagerName) { this.warehouseManagerName = warehouseManagerName; }\n    public String getWarehouseManagerEmail() { return warehouseManagerEmail; }\n    public void setWarehouseManagerEmail(String warehouseManagerEmail) { this.warehouseManagerEmail = warehouseManagerEmail; }\n`
  );
  write(dtoFile, dtoCode);
  console.log("[2/4] Updated AdminShipmentDTO.java with warehouseManagerName and warehouseManagerEmail");
} else {
  console.log("[2/4] AdminShipmentDTO.java already has warehouseManagerName");
}

// 3. Update AdminShipmentController.java
const ctrlFile = "controller/AdminShipmentController.java";
let ctrlCode = read(ctrlFile);
const oldCtrlCall = `        AdminShipmentDTO created = adminShipmentService.createShipment(
                request.getOrderId(),
                request.getInitialLocation(),
                request.getDriverId(),
                request.getVehicleId()
        );`;
const newCtrlCall = `        AdminShipmentDTO created = adminShipmentService.createShipment(
                request.getOrderId(),
                request.getWarehouseId()
        );`;
if (ctrlCode.includes(oldCtrlCall)) {
  ctrlCode = ctrlCode.replace(oldCtrlCall, newCtrlCall);
  write(ctrlFile, ctrlCode);
  console.log("[3/4] Updated AdminShipmentController.java to pass (orderId, warehouseId)");
} else if (ctrlCode.includes("request.getWarehouseId()")) {
  console.log("[3/4] AdminShipmentController.java already updated");
} else {
  console.warn("[3/4] Pattern in AdminShipmentController.java not matched directly, checking...");
}

// 4. Update AdminShipmentService.java createShipment method and convertToDto mapping
const serviceFile = "service/AdminShipmentService.java";
let serviceCode = read(serviceFile);

// Replace createShipment method
const startIdx = serviceCode.indexOf("    public AdminShipmentDTO createShipment(");
const endIdx = serviceCode.indexOf("    public AdminShipmentDTO updateShipment(", startIdx);

if (startIdx >= 0 && endIdx > startIdx) {
  const newCreateMethod = `    @Transactional
    public AdminShipmentDTO createShipment(Long orderId, Long warehouseId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot create a shipment for cancelled order " + order.getOrderNumber());
        }
        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new IllegalArgumentException("Cannot create a shipment for already delivered order " + order.getOrderNumber());
        }

        Optional<Shipment> existing = shipmentRepository.findByOrder(order);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("A shipment has already been created for order " + order.getOrderNumber() + " (" + existing.get().getTrackingNumber() + ")");
        }

        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + warehouseId));

        if (warehouse.getStatus() != WarehouseStatus.ACTIVE) {
            throw new IllegalArgumentException("Cannot assign inactive warehouse " + warehouse.getWarehouseCode() + " for fulfillment.");
        }

        Address pickup = order.getPickupAddress();
        Address delivery = order.getDeliveryAddress();

        ensureCoordinates(pickup);
        ensureCoordinates(delivery);

        // Connect order to the selected fulfillment warehouse
        order.setOriginWarehouse(warehouse);
        orderRepository.save(order);

        Shipment shipment = new Shipment();
        shipment.setTrackingNumber(generateUniqueTrackingNumber());
        shipment.setOrder(order);
        shipment.setOriginWarehouse(warehouse);

        // Driver & Vehicle are NOT assigned during Admin creation (Warehouse Manager operational responsibility)
        shipment.setDriver(null);
        shipment.setVehicle(null);
        shipment.setAssignmentStatus("Awaiting Warehouse Assignment");
        shipment.setAssignedBy("Not Assigned");
        shipment.setAssignedAt(null);

        // Initial shipment status
        OrderStatus initialStatus = order.getStatus();
        if (initialStatus == null || initialStatus == OrderStatus.CANCELLED) {
            initialStatus = OrderStatus.PENDING;
        }
        shipment.setStatus(initialStatus);
        shipment.setOperationalStage("READY_FOR_PROCESSING");

        // Initial location set to fulfillment warehouse
        String locName = warehouse.getWarehouseName() + " (" + warehouse.getWarehouseCode() + ")";
        shipment.setCurrentLocationName(locName);
        if (warehouse.getLatitude() != null && warehouse.getLongitude() != null) {
            shipment.setCurrentLatitude(warehouse.getLatitude());
            shipment.setCurrentLongitude(warehouse.getLongitude());
        } else if (pickup != null) {
            shipment.setCurrentLatitude(pickup.getLatitude());
            shipment.setCurrentLongitude(pickup.getLongitude());
        }

        LocalDate estimatedDate = calculateEstimatedDeliveryDate(order);
        shipment.setEstimatedDeliveryDate(estimatedDate);

        LocalDateTime now = LocalDateTime.now();
        shipment.setCreatedAt(now);
        shipment.setUpdatedAt(now);

        Shipment savedShipment = shipmentRepository.save(shipment);
        log.info("Admin created new shipment {} for order {} at fulfillment warehouse {}",
                savedShipment.getTrackingNumber(), order.getOrderNumber(), warehouse.getWarehouseCode());

        // Baseline milestone event
        ShipmentTrackingEvent event = new ShipmentTrackingEvent(
                savedShipment,
                savedShipment.getStatus(),
                "Shipment Created from Order #" + order.getOrderNumber(),
                warehouse.getWarehouseName(),
                "Shipment registered and assigned to fulfillment warehouse " + warehouse.getWarehouseName() + " (" + warehouse.getWarehouseCode() + "). Awaiting warehouse manager operational processing."
        );
        eventRepository.save(event);

        // Notifications
        try {
            if (order.getCustomer() != null) {
                notificationService.createNotification(
                        order.getCustomer(),
                        "Shipment Created",
                        "Your shipment #" + savedShipment.getTrackingNumber() + " for order #" + order.getOrderNumber() + " has been booked for fulfillment at " + warehouse.getWarehouseName() + ".",
                        "SHIPMENT"
                );
            }
            notificationService.notifyAdmins(
                    "Shipment Created",
                    "Shipment #" + savedShipment.getTrackingNumber() + " created for order #" + order.getOrderNumber() + " at " + warehouse.getWarehouseCode() + ".",
                    "SHIPMENT_UPDATE"
            );
        } catch (Exception ex) {
            log.warn("Failed to notify for new shipment {}: {}", savedShipment.getTrackingNumber(), ex.getMessage());
        }

        return convertToDto(savedShipment, true);
    }

`;
  serviceCode = serviceCode.substring(0, startIdx) + newCreateMethod + serviceCode.substring(endIdx);

  // Update convertToDto to populate warehouseManagerName and warehouseManagerEmail
  const whTarget = `        if (s.getOriginWarehouse() != null) {
            dto.setWarehouseId(s.getOriginWarehouse().getId());
            dto.setWarehouseCode(s.getOriginWarehouse().getWarehouseCode());
            dto.setWarehouseName(s.getOriginWarehouse().getWarehouseName());
        }`;
  const whReplacement = `        if (s.getOriginWarehouse() != null) {
            Warehouse wh = s.getOriginWarehouse();
            dto.setWarehouseId(wh.getId());
            dto.setWarehouseCode(wh.getWarehouseCode());
            dto.setWarehouseName(wh.getWarehouseName());
            dto.setWarehouseManagerName(wh.getManagerName() != null ? wh.getManagerName() : "Not Assigned");
            dto.setWarehouseManagerEmail(wh.getManagerEmail() != null ? wh.getManagerEmail() : "");
        }`;
  if (serviceCode.includes(whTarget)) {
    serviceCode = serviceCode.replace(whTarget, whReplacement);
  }

  write(serviceFile, serviceCode);
  console.log("[4/4] Updated AdminShipmentService.java createShipment and convertToDto");
} else {
  console.error("[4/4] Could not find createShipment range in AdminShipmentService.java");
}

console.log("=== BACKEND UPDATES COMPLETE ===");
