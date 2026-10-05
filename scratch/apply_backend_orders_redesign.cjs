const fs = require('fs');
const path = require('path');

const basePath = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

// 1. Update ShipmentService.java
const shipmentServicePath = path.join(basePath, "service/ShipmentService.java");
let shipmentServiceContent = fs.readFileSync(shipmentServicePath, 'utf8');

// Replace destinationWarehouse resolution in createShipmentForOrder
shipmentServiceContent = shipmentServiceContent.replace(
  /\/\/ Resolve Destination Warehouse independently from deliveryAddress[\s\S]*?Warehouse destWh = null;[\s\S]*?destWh = fulfillmentEngineService\.resolveWarehouseForAddress\(delivery\);[\s\S]*?}/,
  `// Direct delivery model: NO destination warehouse
        Warehouse destWh = null;`
);

shipmentServiceContent = shipmentServiceContent.replace(
  /shipment\.setDestinationWarehouse\(destWh\);/,
  `shipment.setDestinationWarehouse(null);`
);

fs.writeFileSync(shipmentServicePath, shipmentServiceContent, 'utf8');
console.log("Updated ShipmentService.java");

// 2. Write full WarehouseManagerService.java
// Let's read the backup and update it cleanly
const wmServicePath = path.join(basePath, "service/WarehouseManagerService.java");
let wmService = fs.readFileSync(wmServicePath + ".bak", 'utf8');

// Check constructor and fields: add orderRepository and shipmentService if missing
if (!wmService.includes("private final OrderRepository orderRepository;")) {
  wmService = wmService.replace(
    "private final ShipmentTrackingEventRepository trackingEventRepository;",
    `private final ShipmentTrackingEventRepository trackingEventRepository;\n    private final OrderRepository orderRepository;\n    private final ShipmentService shipmentService;`
  );

  wmService = wmService.replace(
    "ShipmentTrackingEventRepository trackingEventRepository) {",
    `ShipmentTrackingEventRepository trackingEventRepository,\n            OrderRepository orderRepository,\n            ShipmentService shipmentService) {`
  );

  wmService = wmService.replace(
    "this.trackingEventRepository = trackingEventRepository;\n    }",
    `this.trackingEventRepository = trackingEventRepository;\n        this.orderRepository = orderRepository;\n        this.shipmentService = shipmentService;\n    }`
  );
}

// Update getIncomingShipments, getOutgoingShipments, getShipmentById
wmService = wmService.replace(
  /@Transactional\(readOnly = true\)\s+public List<WarehouseShipmentDTO> getIncomingShipments\(\) \{[\s\S]*?return list\.stream\(\)\.map\(this::mapToShipmentDTO\)\.collect\(Collectors\.toList\(\)\);\s+\}/,
  `@Transactional(readOnly = true)
    public List<WarehouseShipmentDTO> getIncomingShipments() {
        // Direct delivery model: No incoming shipments to destination warehouse
        return Collections.emptyList();
    }`
);

wmService = wmService.replace(
  /@Transactional\(readOnly = true\)\s+public List<WarehouseShipmentDTO> getOutgoingShipments\(\) \{[\s\S]*?return list\.stream\(\)\.map\(this::mapToShipmentDTO\)\.collect\(Collectors\.toList\(\)\);\s+\}/,
  `@Transactional(readOnly = true)
    public List<WarehouseShipmentDTO> getOutgoingShipments() {
        Warehouse warehouse = getScopedWarehouse();
        List<Shipment> list = shipmentRepository.findByOriginWarehouseOrderByCreatedAtDesc(warehouse);
        return list.stream()
                .filter(s -> s.getStatus() != OrderStatus.CANCELLED)
                .map(this::mapToShipmentDTO)
                .collect(Collectors.toList());
    }`
);

wmService = wmService.replace(
  /boolean isOrigin = shipment\.getOriginWarehouse\(\) != null && shipment\.getOriginWarehouse\(\)\.getId\(\)\.equals\(warehouse\.getId\(\)\);\s+boolean isDestination = shipment\.getDestinationWarehouse\(\) != null && shipment\.getDestinationWarehouse\(\)\.getId\(\)\.equals\(warehouse\.getId\(\)\);\s+if \(!isOrigin && !isDestination\) \{/,
  `boolean isOrigin = shipment.getOriginWarehouse() != null && shipment.getOriginWarehouse().getId().equals(warehouse.getId());
        if (!isOrigin) {`
);

// Update Dashboard incoming KPI
wmService = wmService.replace(
  /List<Shipment> incoming = shipmentRepository\.findActiveIncomingByWarehouse\(warehouse\);\s+dto\.setIncomingShipmentsCount\(incoming\.size\(\)\);\s+dto\.setIncomingPreview\(incoming\.stream\(\)\.limit\(5\)\.map\(this::mapToShipmentDTO\)\.collect\(Collectors\.toList\(\)\)\);/,
  `// Direct Delivery: Zero incoming shipments
        dto.setIncomingShipmentsCount(0);
        dto.setIncomingPreview(Collections.emptyList());`
);

// Add Order methods before FLEET TRACKING & LIVE MAP or helper methods
const orderMethods = `
    // ==========================================
    // MY ORDERS (WAREHOUSE SCOPED)
    // ==========================================

    @Transactional(readOnly = true)
    public List<WarehouseOrderDTO> getWarehouseOrders(String search, String status, String deliveryType) {
        Warehouse warehouse = getScopedWarehouse();
        List<Order> orders = orderRepository.findByOriginWarehouseOrderByCreatedAtDesc(warehouse);

        return orders.stream()
                .filter(o -> {
                    if (search != null && !search.isBlank()) {
                        String s = search.trim().toLowerCase();
                        boolean matchNum = o.getOrderNumber() != null && o.getOrderNumber().toLowerCase().contains(s);
                        boolean matchCust = o.getCustomer() != null && (
                                (o.getCustomer().getFullName() != null && o.getCustomer().getFullName().toLowerCase().contains(s)) ||
                                (o.getCustomer().getEmail() != null && o.getCustomer().getEmail().toLowerCase().contains(s)) ||
                                (o.getCustomer().getPhone() != null && o.getCustomer().getPhone().toLowerCase().contains(s))
                        );
                        boolean matchPkg = o.getPackageDescription() != null && o.getPackageDescription().toLowerCase().contains(s);
                        boolean matchPickup = o.getPickupAddress() != null && (
                                (o.getPickupAddress().getCity() != null && o.getPickupAddress().getCity().toLowerCase().contains(s)) ||
                                (o.getPickupAddress().getAddressLine1() != null && o.getPickupAddress().getAddressLine1().toLowerCase().contains(s))
                        );
                        boolean matchDelivery = o.getDeliveryAddress() != null && (
                                (o.getDeliveryAddress().getCity() != null && o.getDeliveryAddress().getCity().toLowerCase().contains(s)) ||
                                (o.getDeliveryAddress().getAddressLine1() != null && o.getDeliveryAddress().getAddressLine1().toLowerCase().contains(s))
                        );
                        if (!matchNum && !matchCust && !matchPkg && !matchPickup && !matchDelivery) return false;
                    }
                    if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
                        if (o.getStatus() == null || !o.getStatus().name().equalsIgnoreCase(status)) return false;
                    }
                    if (deliveryType != null && !deliveryType.isBlank() && !deliveryType.equalsIgnoreCase("ALL")) {
                        if (o.getDeliveryType() == null || !o.getDeliveryType().name().equalsIgnoreCase(deliveryType)) return false;
                    }
                    return true;
                })
                .map(this::mapToOrderDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WarehouseOrderDTO getWarehouseOrderById(Long id) {
        Warehouse warehouse = getScopedWarehouse();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));

        if (order.getOriginWarehouse() == null || !order.getOriginWarehouse().getId().equals(warehouse.getId())) {
            throw new AccessDeniedException("Unauthorized: Order does not belong to your assigned warehouse (" + warehouse.getWarehouseCode() + ").");
        }

        return mapToOrderDTO(order);
    }

    public WarehouseOrderDTO startOrderProcessing(Long orderId) {
        Warehouse warehouse = getScopedWarehouse();
        User user = getAuthenticatedUser();
        String performer = user != null && user.getFullName() != null ? user.getFullName() : "Warehouse Manager";

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (order.getOriginWarehouse() == null || !order.getOriginWarehouse().getId().equals(warehouse.getId())) {
            throw new AccessDeniedException("Unauthorized: Order does not belong to your assigned warehouse (" + warehouse.getWarehouseCode() + ").");
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Cannot process a cancelled order.");
        }
        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new IllegalStateException("Cannot process an already delivered order.");
        }

        Shipment shipment = shipmentRepository.findByOrder(order)
                .orElseGet(() -> shipmentService.createShipmentForOrder(order));

        shipment.setOperationalStage("PICKING");
        shipment.setUpdatedAt(LocalDateTime.now());
        shipmentRepository.save(shipment);

        ShipmentTrackingEvent event = new ShipmentTrackingEvent(
                shipment,
                shipment.getStatus() != null ? shipment.getStatus() : OrderStatus.CONFIRMED,
                "Picking In Progress",
                warehouse.getWarehouseName() + ", " + warehouse.getCity(),
                "Warehouse personnel started picking order items from inventory (Manager: " + performer + ")."
        );
        trackingEventRepository.save(event);

        return mapToOrderDTO(order);
    }

    public WarehouseOrderDTO markOrderPacked(Long orderId) {
        Warehouse warehouse = getScopedWarehouse();
        User user = getAuthenticatedUser();
        String performer = user != null && user.getFullName() != null ? user.getFullName() : "Warehouse Manager";

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (order.getOriginWarehouse() == null || !order.getOriginWarehouse().getId().equals(warehouse.getId())) {
            throw new AccessDeniedException("Unauthorized: Order does not belong to your assigned warehouse (" + warehouse.getWarehouseCode() + ").");
        }

        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new IllegalStateException("Cannot pack a terminal status order.");
        }

        Shipment shipment = shipmentRepository.findByOrder(order)
                .orElseGet(() -> shipmentService.createShipmentForOrder(order));

        shipment.setOperationalStage("PACKED");
        shipment.setUpdatedAt(LocalDateTime.now());
        shipmentRepository.save(shipment);

        ShipmentTrackingEvent event = new ShipmentTrackingEvent(
                shipment,
                shipment.getStatus() != null ? shipment.getStatus() : OrderStatus.CONFIRMED,
                "Order Packed & Sealed",
                warehouse.getWarehouseName() + ", " + warehouse.getCity(),
                "Items packed, verified, and sealed in shipping carton. Staged for dispatch (Manager: " + performer + ")."
        );
        trackingEventRepository.save(event);

        return mapToOrderDTO(order);
    }

    public WarehouseOrderDTO markOrderReadyForDispatch(Long orderId) {
        Warehouse warehouse = getScopedWarehouse();
        User user = getAuthenticatedUser();
        String performer = user != null && user.getFullName() != null ? user.getFullName() : "Warehouse Manager";

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (order.getOriginWarehouse() == null || !order.getOriginWarehouse().getId().equals(warehouse.getId())) {
            throw new AccessDeniedException("Unauthorized: Order does not belong to your assigned warehouse (" + warehouse.getWarehouseCode() + ").");
        }

        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new IllegalStateException("Cannot stage a terminal status order.");
        }

        Shipment shipment = shipmentRepository.findByOrder(order)
                .orElseGet(() -> shipmentService.createShipmentForOrder(order));

        shipment.setOperationalStage("READY_FOR_DISPATCH");
        shipment.setUpdatedAt(LocalDateTime.now());
        shipmentRepository.save(shipment);

        ShipmentTrackingEvent event = new ShipmentTrackingEvent(
                shipment,
                shipment.getStatus() != null ? shipment.getStatus() : OrderStatus.CONFIRMED,
                "Ready for Outbound Dispatch",
                warehouse.getWarehouseName() + ", " + warehouse.getCity(),
                "Shipment positioned at loading dock. Ready for driver and vehicle assignment (Manager: " + performer + ")."
        );
        trackingEventRepository.save(event);

        return mapToOrderDTO(order);
    }

    private WarehouseOrderDTO mapToOrderDTO(Order order) {
        WarehouseOrderDTO dto = new WarehouseOrderDTO();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());

        if (order.getCustomer() != null) {
            dto.setCustomerId(order.getCustomer().getId());
            dto.setCustomerName(order.getCustomer().getFullName());
            dto.setCustomerEmail(order.getCustomer().getEmail());
            dto.setCustomerPhone(order.getCustomer().getPhone());
        }

        if (order.getPickupAddress() != null) {
            Address p = order.getPickupAddress();
            dto.setPickupAddress(p.getAddressLine1() + (p.getAddressLine2() != null ? ", " + p.getAddressLine2() : ""));
            dto.setPickupCity(p.getCity());
            dto.setPickupState(p.getState());
            dto.setPickupPostalCode(p.getPostalCode());
        }

        if (order.getDeliveryAddress() != null) {
            Address d = order.getDeliveryAddress();
            dto.setDeliveryAddress(d.getAddressLine1() + (d.getAddressLine2() != null ? ", " + d.getAddressLine2() : ""));
            dto.setDeliveryCity(d.getCity());
            dto.setDeliveryState(d.getState());
            dto.setDeliveryPostalCode(d.getPostalCode());
        }

        dto.setDeliveryType(order.getDeliveryType() != null ? order.getDeliveryType().name() : "STANDARD");
        dto.setPackageDescription(order.getPackageDescription());
        dto.setPackageQuantity(order.getPackageQuantity());
        dto.setPackageWeight(order.getPackageWeight());
        dto.setSubtotal(order.getSubtotal());
        dto.setPrioritySurcharge(order.getPrioritySurcharge());
        dto.setTaxAmount(order.getTaxAmount());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus() != null ? order.getStatus().name() : "CONFIRMED");
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        if (order.getOriginWarehouse() != null) {
            dto.setOriginWarehouseId(order.getOriginWarehouse().getId());
            dto.setOriginWarehouseName(order.getOriginWarehouse().getWarehouseName());
            dto.setOriginWarehouseCode(order.getOriginWarehouse().getWarehouseCode());
        }

        Optional<Shipment> shipOpt = shipmentRepository.findByOrder(order);
        String stage = "READY_FOR_PROCESSING";
        if (shipOpt.isPresent()) {
            Shipment s = shipOpt.get();
            dto.setShipmentId(s.getId());
            dto.setTrackingNumber(s.getTrackingNumber());
            if (s.getOperationalStage() != null && !s.getOperationalStage().isBlank()) {
                stage = s.getOperationalStage().trim().toUpperCase();
            }
            if (s.getDriver() != null) {
                dto.setDriverName(s.getDriver().getFullName());
            }
            if (s.getVehicle() != null) {
                dto.setVehicleNumber(s.getVehicle().getVehicleNumber());
            }
        }
        dto.setOperationalStage(stage);

        boolean isTerminal = order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.DELIVERED;
        if (isTerminal) {
            dto.setCanStartProcessing(false);
            dto.setCanMarkPacked(false);
            dto.setCanReadyForDispatch(false);
        } else {
            dto.setCanStartProcessing("READY_FOR_PROCESSING".equalsIgnoreCase(stage) || "CONFIRMED".equalsIgnoreCase(stage));
            dto.setCanMarkPacked("PICKING".equalsIgnoreCase(stage));
            dto.setCanReadyForDispatch("PACKED".equalsIgnoreCase(stage));
        }

        if (order.getItems() != null) {
            dto.setItems(order.getItems().stream().map(oi -> {
                com.primeroute.logistics.dto.OrderItemDTO idto = new com.primeroute.logistics.dto.OrderItemDTO();
                idto.setId(oi.getId());
                if (oi.getProduct() != null) {
                    idto.setProductId(oi.getProduct().getId());
                    idto.setProductName(oi.getProduct().getName());
                    idto.setProductSku(oi.getProduct().getSku());
                }
                idto.setQuantity(oi.getQuantity());
                idto.setUnitWeight(oi.getUnitWeight());
                idto.setTotalWeight(oi.getTotalWeight());
                idto.setUnitPrice(oi.getUnitPrice());
                idto.setTotalPrice(oi.getTotalPrice());
                return idto;
            }).collect(Collectors.toList()));
        }

        return dto;
    }
`;

// Insert orderMethods before mapToShipmentDTO or at end of file before closing brace
const lastBrace = wmService.lastIndexOf("}");
wmService = wmService.substring(0, lastBrace) + orderMethods + "\n}\n";

fs.writeFileSync(wmServicePath, wmService, 'utf8');
console.log("Updated WarehouseManagerService.java");

// 3. Update WarehouseManagerController.java
const wmCtrlPath = path.join(basePath, "controller/WarehouseManagerController.java");
let wmCtrl = fs.readFileSync(wmCtrlPath + ".bak", 'utf8');

const controllerOrderEndpoints = `
    // ==========================================
    // MY ORDERS (ORIGIN WAREHOUSE SCOPED)
    // ==========================================

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<WarehouseOrderDTO>>> getWarehouseOrders(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String deliveryType) {
        List<WarehouseOrderDTO> orders = warehouseManagerService.getWarehouseOrders(search, status, deliveryType);
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse orders retrieved successfully", orders));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<WarehouseOrderDTO>> getWarehouseOrderById(@PathVariable Long id) {
        WarehouseOrderDTO order = warehouseManagerService.getWarehouseOrderById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse order retrieved successfully", order));
    }

    @PostMapping("/orders/{id}/start-processing")
    public ResponseEntity<ApiResponse<WarehouseOrderDTO>> startOrderProcessing(@PathVariable Long id) {
        WarehouseOrderDTO order = warehouseManagerService.startOrderProcessing(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Order processing (picking) started successfully", order));
    }

    @PostMapping("/orders/{id}/mark-packed")
    public ResponseEntity<ApiResponse<WarehouseOrderDTO>> markOrderPacked(@PathVariable Long id) {
        WarehouseOrderDTO order = warehouseManagerService.markOrderPacked(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Order marked as packed successfully", order));
    }

    @PostMapping("/orders/{id}/ready-for-dispatch")
    public ResponseEntity<ApiResponse<WarehouseOrderDTO>> markOrderReadyForDispatch(@PathVariable Long id) {
        WarehouseOrderDTO order = warehouseManagerService.markOrderReadyForDispatch(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Order staged and ready for dispatch", order));
    }
`;

const ctrlInsertIndex = wmCtrl.lastIndexOf("}");
wmCtrl = wmCtrl.substring(0, ctrlInsertIndex) + controllerOrderEndpoints + "\n}\n";

fs.writeFileSync(wmCtrlPath, wmCtrl, 'utf8');
console.log("Updated WarehouseManagerController.java");
