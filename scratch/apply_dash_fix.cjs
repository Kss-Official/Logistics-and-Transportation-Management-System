const fs = require('fs');

const backendDir = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management";

// 1. ShipmentRepository.java
const shipRepoPath = backendDir + "\\src\\main\\java\\com\\primeroute\\logistics\\repository\\ShipmentRepository.java";
let shipRepoContent = fs.readFileSync(shipRepoPath, 'utf8');

const targetRepoStr = `@Query("SELECT s FROM Shipment s WHERE s.originWarehouse = :warehouse AND s.operationalStage = 'READY_FOR_DISPATCH' AND s.status != com.primeroute.logistics.entity.OrderStatus.DELIVERED AND s.status != com.primeroute.logistics.entity.OrderStatus.CANCELLED")`;
const replacementRepoStr = `@Query("SELECT s FROM Shipment s WHERE s.originWarehouse = :warehouse AND s.operationalStage = 'READY_FOR_DISPATCH' AND s.status NOT IN (com.primeroute.logistics.entity.OrderStatus.IN_TRANSIT, com.primeroute.logistics.entity.OrderStatus.OUT_FOR_DELIVERY, com.primeroute.logistics.entity.OrderStatus.DELIVERED, com.primeroute.logistics.entity.OrderStatus.CANCELLED)")`;

if (shipRepoContent.includes(targetRepoStr)) {
    shipRepoContent = shipRepoContent.replace(targetRepoStr, replacementRepoStr);
    fs.writeFileSync(shipRepoPath, shipRepoContent, 'utf8');
    console.log("Updated ShipmentRepository.java successfully.");
} else {
    console.log("targetRepoStr not found, checking if already updated...");
}

// 2. WarehouseManagerService.java
const wmServicePath = backendDir + "\\src\\main\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerService.java";
let wmServiceContent = fs.readFileSync(wmServicePath, 'utf8');

// Replace getDashboard shipment section
const targetDashStr = `        List<OrderStatus> activeStatuses = Arrays.asList(OrderStatus.CONFIRMED, OrderStatus.PICKED_UP, OrderStatus.IN_TRANSIT);
        List<Shipment> outgoing = shipmentRepository.findOutgoingByWarehouseAndStatuses(warehouse, activeStatuses);
        dto.setOutgoingShipmentsCount(outgoing.size());
        dto.setOutgoingPreview(outgoing.stream().limit(5).map(this::mapToShipmentDTO).collect(Collectors.toList()));

        List<Shipment> readyForDispatch = shipmentRepository.findReadyForDispatchByWarehouse(warehouse);
        dto.setReadyForDispatchCount(readyForDispatch.size());`;

const replacementDashStr = `        List<Shipment> originShipments = shipmentRepository.findByOriginWarehouseOrderByCreatedAtDesc(warehouse);
        List<Shipment> nonCancelledOutgoing = originShipments.stream()
                .filter(s -> s.getStatus() != OrderStatus.CANCELLED)
                .collect(Collectors.toList());
        dto.setOutgoingShipmentsCount(nonCancelledOutgoing.size());
        dto.setOutgoingPreview(nonCancelledOutgoing.stream().limit(5).map(this::mapToShipmentDTO).collect(Collectors.toList()));

        // Active warehouse operational queue stage counts (scoped to warehouse)
        long readyToProcessCount = 0;
        long pickingCount = 0;
        long packedCount = 0;
        long readyForDispatchCount = 0;

        for (Shipment s : originShipments) {
            // Exclude terminal / in-transit / delivered / cancelled shipments from active warehouse processing queue
            if (s.getStatus() == OrderStatus.DELIVERED || s.getStatus() == OrderStatus.CANCELLED
                    || s.getStatus() == OrderStatus.IN_TRANSIT || s.getStatus() == OrderStatus.OUT_FOR_DELIVERY) {
                continue;
            }
            String stage = s.getOperationalStage() != null ? s.getOperationalStage().trim().toUpperCase() : "READY_FOR_PROCESSING";
            if ("DISPATCHED".equals(stage) || "IN_TRANSIT".equals(stage) || "OUT_FOR_DELIVERY".equals(stage)
                    || "DELIVERED".equals(stage) || "CANCELLED".equals(stage)) {
                continue;
            }

            if ("READY_TO_PROCESS".equals(stage) || "READY_FOR_PROCESSING".equals(stage)) {
                readyToProcessCount++;
            } else if ("PICKING".equals(stage)) {
                pickingCount++;
            } else if ("PACKED".equals(stage)) {
                packedCount++;
            } else if ("READY_FOR_DISPATCH".equals(stage)) {
                readyForDispatchCount++;
            }
        }

        dto.setReadyToProcessCount(readyToProcessCount);
        dto.setPickingCount(pickingCount);
        dto.setPackedCount(packedCount);
        dto.setReadyForDispatchCount(readyForDispatchCount);`;

if (wmServiceContent.includes(targetDashStr)) {
    wmServiceContent = wmServiceContent.replace(targetDashStr, replacementDashStr);
    console.log("Updated getDashboard() in WarehouseManagerService.java.");
} else {
    console.log("targetDashStr not found in WarehouseManagerService.java.");
}

// Check updateShipmentStage validation
const targetStageValStr = `        String currentStage = shipment.getOperationalStage() != null ? shipment.getOperationalStage().toUpperCase() : "READY_FOR_PROCESSING";

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
        }`;

const replacementStageValStr = `        String currentStage = shipment.getOperationalStage() != null ? shipment.getOperationalStage().trim().toUpperCase() : "READY_FOR_PROCESSING";

        // 3. Stage transition state-machine validation
        if ("PICKING".equals(targetStage)) {
            if (!"READY_FOR_PROCESSING".equals(currentStage) && !"READY_TO_PROCESS".equals(currentStage)) {
                throw new IllegalStateException("Invalid stage transition from " + currentStage + " to PICKING. Shipment must be in READY_FOR_PROCESSING stage.");
            }
        } else if ("PACKED".equals(targetStage)) {
            if (!"PICKING".equals(currentStage)) {
                throw new IllegalStateException("Invalid stage transition from " + currentStage + " to PACKED. Shipment must be in PICKING stage.");
            }
        } else if ("READY_FOR_DISPATCH".equals(targetStage)) {
            if (!"PACKED".equals(currentStage)) {
                throw new IllegalStateException("Invalid stage transition from " + currentStage + " to READY_FOR_DISPATCH. Shipment must be in PACKED stage.");
            }
        } else if ("READY_FOR_PROCESSING".equals(targetStage) || "READY_TO_PROCESS".equals(targetStage)) {
            if (!"READY_FOR_PROCESSING".equals(currentStage) && !"READY_TO_PROCESS".equals(currentStage)) {
                throw new IllegalStateException("Cannot revert operational stage back to READY_FOR_PROCESSING from " + currentStage + ".");
            }
        }`;

if (wmServiceContent.includes(targetStageValStr)) {
    wmServiceContent = wmServiceContent.replace(targetStageValStr, replacementStageValStr);
    console.log("Updated updateShipmentStage validation in WarehouseManagerService.java.");
} else {
    console.log("targetStageValStr not found in WarehouseManagerService.java.");
}

fs.writeFileSync(wmServicePath, wmServiceContent, 'utf8');
console.log("Saved WarehouseManagerService.java.");
