const fs = require('fs');
const path = require('path');

const javaBase = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics';
const javaTestBase = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/test/java/com/primeroute/logistics';

// 1. Create WarehouseTrackingEventDTO.java
const trackingEventDtoCode = `package com.primeroute.logistics.dto.warehouse;

import java.time.LocalDateTime;

public class WarehouseTrackingEventDTO {
    private Long id;
    private String status;
    private String title;
    private String description;
    private String locationName;
    private LocalDateTime eventTime;

    public WarehouseTrackingEventDTO() {}

    public WarehouseTrackingEventDTO(Long id, String status, String title, String description, String locationName, LocalDateTime eventTime) {
        this.id = id;
        this.status = status;
        this.title = title;
        this.description = description;
        this.locationName = locationName;
        this.eventTime = eventTime;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }

    public LocalDateTime getEventTime() { return eventTime; }
    public void setEventTime(LocalDateTime eventTime) { this.eventTime = eventTime; }
}
`;
fs.writeFileSync(path.join(javaBase, 'dto/warehouse/WarehouseTrackingEventDTO.java'), trackingEventDtoCode, 'utf8');
console.log('Created WarehouseTrackingEventDTO.java');

// 2. Update WarehouseShipmentDTO.java
let shipmentDtoContent = fs.readFileSync(path.join(javaBase, 'dto/warehouse/WarehouseShipmentDTO.java'), 'utf8');
if (!shipmentDtoContent.includes('private String deliveryType;')) {
    shipmentDtoContent = shipmentDtoContent.replace(
        'private Integer packageQuantity;',
        'private Integer packageQuantity;\n    private String deliveryType;\n    private java.util.List<WarehouseTrackingEventDTO> trackingEvents;'
    );
    shipmentDtoContent = shipmentDtoContent.replace(
        'public Integer getPackageQuantity() { return packageQuantity; }',
        `public String getDeliveryType() { return deliveryType; }
    public void setDeliveryType(String deliveryType) { this.deliveryType = deliveryType; }

    public java.util.List<WarehouseTrackingEventDTO> getTrackingEvents() { return trackingEvents; }
    public void setTrackingEvents(java.util.List<WarehouseTrackingEventDTO> trackingEvents) { this.trackingEvents = trackingEvents; }

    public Integer getPackageQuantity() { return packageQuantity; }`
    );
    fs.writeFileSync(path.join(javaBase, 'dto/warehouse/WarehouseShipmentDTO.java'), shipmentDtoContent, 'utf8');
    console.log('Updated WarehouseShipmentDTO.java');
}

// 3. Update WarehouseDashboardDTO.java
let dashboardDtoContent = fs.readFileSync(path.join(javaBase, 'dto/warehouse/WarehouseDashboardDTO.java'), 'utf8');
if (!dashboardDtoContent.includes('readyToProcessCount')) {
    dashboardDtoContent = dashboardDtoContent.replace(
        'private long readyForDispatchCount;',
        `private long readyToProcessCount;
    private long pickingCount;
    private long packedCount;
    private long readyForDispatchCount;`
    );
    dashboardDtoContent = dashboardDtoContent.replace(
        'public long getReadyForDispatchCount() { return readyForDispatchCount; }',
        `public long getReadyToProcessCount() { return readyToProcessCount; }
    public void setReadyToProcessCount(long readyToProcessCount) { this.readyToProcessCount = readyToProcessCount; }

    public long getPickingCount() { return pickingCount; }
    public void setPickingCount(long pickingCount) { this.pickingCount = pickingCount; }

    public long getPackedCount() { return packedCount; }
    public void setPackedCount(long packedCount) { this.packedCount = packedCount; }

    public long getReadyForDispatchCount() { return readyForDispatchCount; }`
    );
    fs.writeFileSync(path.join(javaBase, 'dto/warehouse/WarehouseDashboardDTO.java'), dashboardDtoContent, 'utf8');
    console.log('Updated WarehouseDashboardDTO.java');
}

// 4. Update WarehouseManagerService.java
let whServiceContent = fs.readFileSync(path.join(javaBase, 'service/WarehouseManagerService.java'), 'utf8');

// Update dashboard KPIs in getDashboardData()
const oldKpiBlockRegex = /long incoming = shipmentRepository\.findByDestinationWarehouseOrderByCreatedAtDesc\(warehouse\)\.size\(\);[\s\S]*?dto\.setReadyForDispatchCount\(readyForDispatch\.size\(\)\);/;

const newKpiBlock = `long incoming = shipmentRepository.findByDestinationWarehouseOrderByCreatedAtDesc(warehouse).size();
        List<Shipment> outgoing = shipmentRepository.findByOriginWarehouseOrderByCreatedAtDesc(warehouse);
        dto.setIncomingShipmentsCount(incoming);
        dto.setOutgoingShipmentsCount(outgoing.size());

        long readyToProcess = outgoing.stream().filter(s -> "READY_FOR_PROCESSING".equalsIgnoreCase(s.getOperationalStage())).count();
        long picking = outgoing.stream().filter(s -> "PICKING".equalsIgnoreCase(s.getOperationalStage())).count();
        long packed = outgoing.stream().filter(s -> "PACKED".equalsIgnoreCase(s.getOperationalStage())).count();
        long readyForDispatch = outgoing.stream().filter(s -> "READY_FOR_DISPATCH".equalsIgnoreCase(s.getOperationalStage()) || "PACKED".equalsIgnoreCase(s.getOperationalStage())).count();

        dto.setReadyToProcessCount(readyToProcess);
        dto.setPickingCount(picking);
        dto.setPackedCount(packed);
        dto.setReadyForDispatchCount(readyForDispatch);`;

whServiceContent = whServiceContent.replace(oldKpiBlockRegex, newKpiBlock);

// Replace updateShipmentStage with enhanced validation and add startPicking & markPacked
const oldUpdateStageRegex = /public WarehouseShipmentDTO updateShipmentStage\(Long id, String stage\) \{[\s\S]*?return mapToShipmentDTO\(saved\);\r?\n    \}/;

const newUpdateStageMethods = `public WarehouseShipmentDTO startPicking(Long id) {
        return updateShipmentStage(id, "PICKING");
    }

    public WarehouseShipmentDTO markPacked(Long id) {
        return updateShipmentStage(id, "PACKED");
    }

    public WarehouseShipmentDTO updateShipmentStage(Long id, String stage) {
        if (stage == null || stage.isBlank()) {
            throw new IllegalArgumentException("Operational stage cannot be blank.");
        }
        String targetStage = stage.trim().toUpperCase();

        Warehouse warehouse = getScopedWarehouse();
        User user = getAuthenticatedUser();
        String performer = user != null && user.getFullName() != null ? user.getFullName() : "Warehouse Manager";

        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found: " + id));

        // 1. Warehouse scoping validation: Manager can only operate on their own warehouse's shipments
        if (shipment.getOriginWarehouse() == null || !shipment.getOriginWarehouse().getId().equals(warehouse.getId())) {
            throw new AccessDeniedException("Unauthorized: Shipment does not belong to your assigned warehouse (" + warehouse.getWarehouseCode() + ").");
        }

        // 2. Terminal status validation: Cancelled or Delivered shipments cannot transition
        if (shipment.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Cannot update operational stage for a cancelled shipment.");
        }
        if (shipment.getStatus() == OrderStatus.DELIVERED) {
            throw new IllegalStateException("Cannot update operational stage for a delivered shipment.");
        }

        String currentStage = shipment.getOperationalStage() != null ? shipment.getOperationalStage().toUpperCase() : "READY_FOR_PROCESSING";

        // 3. Stage transition state-machine validation
        if ("PICKING".equals(targetStage)) {
            if (!"READY_FOR_PROCESSING".equals(currentStage)) {
                throw new IllegalStateException("Invalid stage transition from " + currentStage + " to PICKING. Shipment must be in READY_FOR_PROCESSING stage.");
            }
        } else if ("PACKED".equals(targetStage)) {
            if (!"PICKING".equals(currentStage)) {
                throw new IllegalStateException("Invalid stage transition from " + currentStage + " to PACKED. Shipment must be in PICKING stage.");
            }
        } else if ("READY_FOR_PROCESSING".equals(targetStage)) {
            if (!"READY_FOR_PROCESSING".equals(currentStage)) {
                throw new IllegalStateException("Cannot revert operational stage back to READY_FOR_PROCESSING from " + currentStage + ".");
            }
        }

        shipment.setOperationalStage(targetStage);
        shipment.setUpdatedAt(LocalDateTime.now());

        // 4. Create and persist tracking milestone event
        String eventTitle;
        String eventDescription;
        if ("PICKING".equals(targetStage)) {
            eventTitle = "Warehouse Picking Started";
            eventDescription = "Warehouse picking started.";
        } else if ("PACKED".equals(targetStage)) {
            eventTitle = "Shipment Packed";
            eventDescription = "Shipment packed and ready for dispatch assignment.";
        } else {
            eventTitle = "Warehouse Stage Updated: " + targetStage;
            eventDescription = "Operational stage updated to " + targetStage + " by " + performer;
        }

        ShipmentTrackingEvent event = new ShipmentTrackingEvent(
                shipment,
                shipment.getStatus() != null ? shipment.getStatus() : OrderStatus.CONFIRMED,
                eventTitle,
                warehouse.getWarehouseName() + ", " + warehouse.getCity(),
                eventDescription
        );
        trackingEventRepository.save(event);

        Shipment saved = shipmentRepository.save(shipment);
        return mapToShipmentDTO(saved);
    }`;

whServiceContent = whServiceContent.replace(oldUpdateStageRegex, newUpdateStageMethods);

// Update mapToShipmentDTO to include deliveryType and trackingEvents
const oldMapShipmentRegex = /private WarehouseShipmentDTO mapToShipmentDTO\(Shipment s\) \{[\s\S]*?return dto;\r?\n    \}/;

const newMapShipment = `private WarehouseShipmentDTO mapToShipmentDTO(Shipment s) {
        WarehouseShipmentDTO dto = new WarehouseShipmentDTO();
        dto.setId(s.getId());
        dto.setTrackingNumber(s.getTrackingNumber());
        dto.setStatus(s.getStatus().name());
        dto.setOperationalStage(s.getOperationalStage());
        if (s.getDriver() != null && s.getVehicle() != null) {
            dto.setAssignmentStatus(s.getAssignmentStatus() != null ? s.getAssignmentStatus() : "ASSIGNED");
            dto.setAssignedBy(s.getAssignedBy() != null ? s.getAssignedBy() : "Warehouse Manager");
            dto.setAssignedAt(s.getAssignedAt() != null ? s.getAssignedAt() : s.getUpdatedAt());
        } else {
            dto.setAssignmentStatus("UNASSIGNED");
            dto.setAssignedBy(s.getAssignedBy() != null ? s.getAssignedBy() : "Not Assigned");
            dto.setAssignedAt(s.getAssignedAt());
        }
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

        if (s.getOrder() != null) {
            dto.setOrderId(s.getOrder().getId());
            dto.setOrderNumber(s.getOrder().getOrderNumber());
            dto.setPackageDescription(s.getOrder().getPackageDescription());
            dto.setPackageWeight(s.getOrder().getPackageWeight());
            dto.setPackageQuantity(s.getOrder().getPackageQuantity());
            dto.setDeliveryType(s.getOrder().getDeliveryType() != null ? s.getOrder().getDeliveryType().name() : "STANDARD");

            if (s.getOrder().getPickupAddress() != null) {
                dto.setPickupAddress(s.getOrder().getPickupAddress().getAddressLine1() + ", " + s.getOrder().getPickupAddress().getCity());
                dto.setOriginCity(s.getOrder().getPickupAddress().getCity());
            }
            if (s.getOrder().getDeliveryAddress() != null) {
                dto.setDeliveryAddress(s.getOrder().getDeliveryAddress().getAddressLine1() + ", " + s.getOrder().getDeliveryAddress().getCity());
                dto.setDestinationCity(s.getOrder().getDeliveryAddress().getCity());
            }

            if (s.getOrder().getItems() != null && !s.getOrder().getItems().isEmpty()) {
                dto.setItems(s.getOrder().getItems().stream().map(oi -> new com.primeroute.logistics.dto.OrderItemDTO(
                        oi.getId(),
                        oi.getProduct() != null ? oi.getProduct().getId() : null,
                        oi.getProduct() != null ? oi.getProduct().getSku() : "",
                        oi.getProduct() != null ? oi.getProduct().getName() : "",
                        oi.getProduct() != null ? oi.getProduct().getCategory() : "",
                        oi.getQuantity(),
                        oi.getUnitWeight(),
                        oi.getUnitPrice(),
                        oi.getTotalWeight()
                )).collect(Collectors.toList()));
            }
        }

        if (s.getOriginWarehouse() != null) {
            dto.setOriginWarehouseId(s.getOriginWarehouse().getId());
            dto.setOriginWarehouseName(s.getOriginWarehouse().getWarehouseName());
            if (dto.getOriginCity() == null) dto.setOriginCity(s.getOriginWarehouse().getCity());
        }

        if (s.getDestinationWarehouse() != null) {
            dto.setDestinationWarehouseId(s.getDestinationWarehouse().getId());
            dto.setDestinationWarehouseName(s.getDestinationWarehouse().getWarehouseName());
            if (dto.getDestinationCity() == null) dto.setDestinationCity(s.getDestinationWarehouse().getCity());
        }

        if (s.getDriver() != null) {
            dto.setDriverId(s.getDriver().getId());
            dto.setDriverName(s.getDriver().getFullName());
            dto.setDriverPhone(s.getDriver().getPhone());
            dto.setDriverStatus(s.getDriver().getStatus().name());
        }

        if (s.getVehicle() != null) {
            dto.setVehicleId(s.getVehicle().getId());
            dto.setVehicleNumber(s.getVehicle().getVehicleNumber());
            dto.setVehicleType(s.getVehicle().getVehicleType().name());
            dto.setVehicleModel(s.getVehicle().getModel());
            dto.setVehicleStatus(s.getVehicle().getStatus().name());
        }

        dto.setEstimatedDeliveryDate(s.getEstimatedDeliveryDate());
        dto.setCreatedAt(s.getCreatedAt());
        dto.setUpdatedAt(s.getUpdatedAt());
        dto.setCurrentLatitude(s.getCurrentLatitude());
        dto.setCurrentLongitude(s.getCurrentLongitude());
        dto.setCurrentLocationName(s.getCurrentLocationName());

        // Attach chronological tracking events
        List<ShipmentTrackingEvent> events = trackingEventRepository.findByShipmentOrderByEventTimeAsc(s);
        if (events != null && !events.isEmpty()) {
            dto.setTrackingEvents(events.stream().map(e -> new WarehouseTrackingEventDTO(
                    e.getId(),
                    e.getStatus(),
                    e.getTitle(),
                    e.getDescription(),
                    e.getLocationName(),
                    e.getEventTime()
            )).collect(Collectors.toList()));
        }

        boolean isReady = "READY_FOR_DISPATCH".equalsIgnoreCase(s.getOperationalStage())
                && s.getDriver() != null
                && s.getVehicle() != null;
        dto.setReadyForDispatch(isReady);

        return dto;
    }`;

whServiceContent = whServiceContent.replace(oldMapShipmentRegex, newMapShipment);
fs.writeFileSync(path.join(javaBase, 'service/WarehouseManagerService.java'), whServiceContent, 'utf8');
console.log('Updated WarehouseManagerService.java');

// 5. Update WarehouseManagerController.java
let whControllerContent = fs.readFileSync(path.join(javaBase, 'controller/WarehouseManagerController.java'), 'utf8');
if (!whControllerContent.includes('/shipments/{id}/start-picking')) {
    const stageEndpoint = `    @PatchMapping("/shipments/{id}/stage")
    public ResponseEntity<ApiResponse<WarehouseShipmentDTO>> updateShipmentStage(
            @PathVariable Long id,
            @RequestParam String stage) {
        WarehouseShipmentDTO updated = warehouseManagerService.updateShipmentStage(id, stage);
        return ResponseEntity.ok(new ApiResponse<>(true, "Operational stage updated successfully", updated));
    }

    @PostMapping("/shipments/{id}/start-picking")
    public ResponseEntity<ApiResponse<WarehouseShipmentDTO>> startPicking(@PathVariable Long id) {
        WarehouseShipmentDTO shipment = warehouseManagerService.startPicking(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse picking started successfully", shipment));
    }

    @PostMapping("/shipments/{id}/mark-packed")
    public ResponseEntity<ApiResponse<WarehouseShipmentDTO>> markPacked(@PathVariable Long id) {
        WarehouseShipmentDTO shipment = warehouseManagerService.markPacked(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Shipment marked as packed successfully", shipment));
    }`;

    whControllerContent = whControllerContent.replace(
        /    @PatchMapping\("\/shipments\/\{id\}\/stage"\)[\s\S]*?return ResponseEntity\.ok\(new ApiResponse<>\(true, "Operational stage updated successfully", updated\)\);\r?\n    \}/,
        stageEndpoint
    );
    fs.writeFileSync(path.join(javaBase, 'controller/WarehouseManagerController.java'), whControllerContent, 'utf8');
    console.log('Updated WarehouseManagerController.java');
}
