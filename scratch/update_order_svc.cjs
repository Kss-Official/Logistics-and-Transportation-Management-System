const fs = require('fs');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service";

let orderSvc = fs.readFileSync(`${BACKEND_BASE}/OrderService.java`, 'utf8');

// Update OrderService.java so customer order creation leaves the order ready for Admin warehouse selection & shipment creation
orderSvc = orderSvc.replace(
  `        // Create initial shipment linked to origin warehouse
        try {
            Shipment initialShipment = shipmentService.createShipmentForOrder(savedOrder);
            if (selectedWarehouse != null && initialShipment != null) {
                initialShipment.setOriginWarehouse(selectedWarehouse);
                initialShipment.setOperationalStage("PICKING");
                initialShipment.setStatus(OrderStatus.CONFIRMED);
                shipmentRepository.save(initialShipment);
            }
        } catch (Exception ex) {
            log.warn("Error provisioning initial shipment for order {}: {}", savedOrder.getOrderNumber(), ex.getMessage());
        }`,
  `        // Order is persisted in PENDING status awaiting Admin fulfillment warehouse selection & shipment creation
        if (selectedWarehouse != null) {
            savedOrder.setOriginWarehouse(selectedWarehouse);
            orderRepository.save(savedOrder);
        }`
);

fs.writeFileSync(`${BACKEND_BASE}/OrderService.java`, orderSvc, 'utf8');
console.log('Updated OrderService.java so customer order waits for Admin shipment creation');
