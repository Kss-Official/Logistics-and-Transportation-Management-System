const fs = require('fs');

const fService = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerService.java';
const fController = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\controller\\WarehouseManagerController.java';

let serviceContent = fs.readFileSync(fService, 'utf8');
let controllerContent = fs.readFileSync(fController, 'utf8');

// 1. In WarehouseManagerService.java, ensure markReadyForDispatch exists and updateShipmentStage handles READY_FOR_DISPATCH and READY_TO_PROCESS
if (!serviceContent.includes('public WarehouseShipmentDTO markReadyForDispatch(Long id)')) {
  serviceContent = serviceContent.replace(
    'public WarehouseShipmentDTO markPacked(Long id) {\n        return updateShipmentStage(id, "PACKED");\n    }',
    'public WarehouseShipmentDTO markPacked(Long id) {\n        return updateShipmentStage(id, "PACKED");\n    }\n\n    public WarehouseShipmentDTO markReadyForDispatch(Long id) {\n        return updateShipmentStage(id, "READY_FOR_DISPATCH");\n    }'
  );
}

// Check updateShipmentStage transition logic
if (!serviceContent.includes('"READY_FOR_DISPATCH".equals(targetStage)')) {
  serviceContent = serviceContent.replace(
    '        } else if ("PACKED".equals(targetStage)) {\n            if (!"PICKING".equals(currentStage)) {\n                throw new IllegalStateException("Invalid stage transition from " + currentStage + " to PACKED. Shipment must be in PICKING stage.");\n            }\n        } else if ("READY_FOR_PROCESSING".equals(targetStage)) {',
    '        } else if ("PACKED".equals(targetStage)) {\n            if (!"PICKING".equals(currentStage)) {\n                throw new IllegalStateException("Invalid stage transition from " + currentStage + " to PACKED. Shipment must be in PICKING stage.");\n            }\n        } else if ("READY_FOR_DISPATCH".equals(targetStage)) {\n            if (!"PACKED".equals(currentStage) && !"READY_FOR_DISPATCH".equals(currentStage)) {\n                throw new IllegalStateException("Invalid stage transition from " + currentStage + " to READY_FOR_DISPATCH. Shipment must be in PACKED stage.");\n            }\n        } else if ("READY_FOR_PROCESSING".equals(targetStage) || "READY_TO_PROCESS".equals(targetStage)) {'
  );
}

// Update event title / description in updateShipmentStage for READY_FOR_DISPATCH
if (!serviceContent.includes('eventTitle = "Shipment Ready for Dispatch";')) {
  serviceContent = serviceContent.replace(
    '        } else if ("PACKED".equals(targetStage)) {\n            eventTitle = "Shipment Packed";\n            eventDescription = "Shipment packed and ready for dispatch assignment.";\n        } else {',
    '        } else if ("PACKED".equals(targetStage)) {\n            eventTitle = "Shipment Packed";\n            eventDescription = "Shipment packed and ready for dispatch staging.";\n        } else if ("READY_FOR_DISPATCH".equals(targetStage)) {\n            eventTitle = "Shipment Ready for Dispatch";\n            eventDescription = "Shipment staged and ready for fleet assignment.";\n        } else {'
  );
}

fs.writeFileSync(fService, serviceContent, 'utf8');
console.log('WarehouseManagerService.java updated successfully.');

// 2. In WarehouseManagerController.java, add markReadyForDispatch endpoint
if (!controllerContent.includes('@PostMapping("/shipments/{id}/ready-for-dispatch")')) {
  controllerContent = controllerContent.replace(
    '@PostMapping("/shipments/{id}/mark-packed")\n    public ResponseEntity<ApiResponse<WarehouseShipmentDTO>> markPacked(@PathVariable Long id) {\n        WarehouseShipmentDTO shipment = warehouseManagerService.markPacked(id);\n        return ResponseEntity.ok(new ApiResponse<>(true, "Shipment marked as packed successfully", shipment));\n    }',
    '@PostMapping("/shipments/{id}/mark-packed")\n    public ResponseEntity<ApiResponse<WarehouseShipmentDTO>> markPacked(@PathVariable Long id) {\n        WarehouseShipmentDTO shipment = warehouseManagerService.markPacked(id);\n        return ResponseEntity.ok(new ApiResponse<>(true, "Shipment marked as packed successfully", shipment));\n    }\n\n    @PostMapping("/shipments/{id}/ready-for-dispatch")\n    public ResponseEntity<ApiResponse<WarehouseShipmentDTO>> markReadyForDispatch(@PathVariable Long id) {\n        WarehouseShipmentDTO shipment = warehouseManagerService.markReadyForDispatch(id);\n        return ResponseEntity.ok(new ApiResponse<>(true, "Shipment marked as ready for dispatch successfully", shipment));\n    }'
  );
  fs.writeFileSync(fController, controllerContent, 'utf8');
  console.log('WarehouseManagerController.java updated successfully.');
} else {
  console.log('WarehouseManagerController.java already has markReadyForDispatch endpoint.');
}
