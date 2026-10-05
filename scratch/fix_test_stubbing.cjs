const fs = require('fs');
const path = require('path');

const TEST_PATH = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\test\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerFleetAssignmentTest.java';

let content = fs.readFileSync(TEST_PATH, 'utf8');

// Replace testAssignFleet_MissingDriverOrVehicle_ThrowsException
const oldTest = `    @Test
    @DisplayName("18. Missing vehicle or driver in request fails atomically")
    void testAssignFleet_MissingDriverOrVehicle_ThrowsException() {
        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));

        // Missing Vehicle
        assertThrows(IllegalArgumentException.class, () -> {
            warehouseManagerService.assignFleet(2001L, new AssignFleetRequest(501L, null));
        });

        // Missing Driver
        assertThrows(IllegalArgumentException.class, () -> {
            warehouseManagerService.assignFleet(2001L, new AssignFleetRequest(null, 601L));
        });

        verify(driverRepository, never()).save(any(Driver.class));
        verify(vehicleRepository, never()).save(any(Vehicle.class));
        verify(trackingEventRepository, never()).save(any(ShipmentTrackingEvent.class));
    }`;

const newTest = `    @Test
    @DisplayName("18. Missing vehicle or driver in request fails atomically")
    void testAssignFleet_MissingDriverOrVehicle_ThrowsException() {
        // Missing Vehicle
        assertThrows(IllegalArgumentException.class, () -> {
            warehouseManagerService.assignFleet(2001L, new AssignFleetRequest(501L, null));
        });

        // Missing Driver
        assertThrows(IllegalArgumentException.class, () -> {
            warehouseManagerService.assignFleet(2001L, new AssignFleetRequest(null, 601L));
        });

        verify(driverRepository, never()).save(any(Driver.class));
        verify(vehicleRepository, never()).save(any(Vehicle.class));
        verify(trackingEventRepository, never()).save(any(ShipmentTrackingEvent.class));
    }`;

content = content.replace(oldTest, newTest);
fs.writeFileSync(TEST_PATH, content, 'utf8');
console.log('Fixed WarehouseManagerFleetAssignmentTest.java');
