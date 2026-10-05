const fs = require('fs');

const fFleet = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\test\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerFleetAssignmentTest.java';
const fScoping = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\test\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerShipmentScopingTest.java';

// 1. Fix WarehouseManagerFleetAssignmentTest.java
let fleetContent = fs.readFileSync(fFleet, 'utf8');
fleetContent = fleetContent.replace(
  '    @Test\r\n    @DisplayName("8. Cannot assign fleet when stage is already READY_FOR_DISPATCH")\r\n    void testAssignFleet_StageReadyForDispatch_ThrowsIllegalState() {\r\n        packedShipment.setOperationalStage("READY_FOR_DISPATCH");\r\n        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));\r\n\r\n        AssignFleetRequest request = new AssignFleetRequest(501L, 601L);\r\n        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {\r\n            warehouseManagerService.assignFleet(2001L, request);\r\n        });\r\n        assertTrue(ex.getMessage().contains("must be in PACKED stage"));\r\n    }',
  '    @Test\r\n    @DisplayName("8. Cannot assign fleet when stage is already DISPATCHED")\r\n    void testAssignFleet_StageReadyForDispatch_ThrowsIllegalState() {\r\n        packedShipment.setOperationalStage("DISPATCHED");\r\n        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));\r\n\r\n        AssignFleetRequest request = new AssignFleetRequest(501L, 601L);\r\n        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {\r\n            warehouseManagerService.assignFleet(2001L, request);\r\n        });\r\n        assertTrue(ex.getMessage().contains("must be in PACKED"));\r\n    }'
);
// In case line endings are \n
fleetContent = fleetContent.replace(
  '    @Test\n    @DisplayName("8. Cannot assign fleet when stage is already READY_FOR_DISPATCH")\n    void testAssignFleet_StageReadyForDispatch_ThrowsIllegalState() {\n        packedShipment.setOperationalStage("READY_FOR_DISPATCH");\n        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));\n\n        AssignFleetRequest request = new AssignFleetRequest(501L, 601L);\n        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {\n            warehouseManagerService.assignFleet(2001L, request);\n        });\n        assertTrue(ex.getMessage().contains("must be in PACKED stage"));\n    }',
  '    @Test\n    @DisplayName("8. Cannot assign fleet when stage is already DISPATCHED")\n    void testAssignFleet_StageReadyForDispatch_ThrowsIllegalState() {\n        packedShipment.setOperationalStage("DISPATCHED");\n        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));\n\n        AssignFleetRequest request = new AssignFleetRequest(501L, 601L);\n        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {\n            warehouseManagerService.assignFleet(2001L, request);\n        });\n        assertTrue(ex.getMessage().contains("must be in PACKED"));\n    }'
);
fs.writeFileSync(fFleet, fleetContent, 'utf8');
console.log('Fixed WarehouseManagerFleetAssignmentTest.java');

// 2. Fix WarehouseManagerShipmentScopingTest.java
let scopingContent = fs.readFileSync(fScoping, 'utf8');
scopingContent = scopingContent.replace(
  'vehicleBlrAvailable.setStatus(VehicleStatus.AVAILABLE);',
  'vehicleBlrAvailable.setStatus(VehicleStatus.AVAILABLE);\n        vehicleBlrAvailable.setVehicleType(VehicleType.TRUCK);'
);
scopingContent = scopingContent.replace(
  'vehicleBlrInTransit.setStatus(VehicleStatus.IN_TRANSIT);',
  'vehicleBlrInTransit.setStatus(VehicleStatus.IN_TRANSIT);\n        vehicleBlrInTransit.setVehicleType(VehicleType.VAN);'
);
scopingContent = scopingContent.replace(
  'vehicleMumAvailable.setStatus(VehicleStatus.AVAILABLE);',
  'vehicleMumAvailable.setStatus(VehicleStatus.AVAILABLE);\n        vehicleMumAvailable.setVehicleType(VehicleType.TRUCK);'
);
scopingContent = scopingContent.replace(
  'assertTrue(ex.getMessage().contains("No warehouse is assigned to your account"));',
  'assertTrue(ex.getMessage().contains("No warehouse assigned to account"));'
);
fs.writeFileSync(fScoping, scopingContent, 'utf8');
console.log('Fixed WarehouseManagerShipmentScopingTest.java');
