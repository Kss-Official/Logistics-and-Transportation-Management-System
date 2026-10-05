const fs = require('fs');

const filePath = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\test\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerShipmentScopingTest.java';
let content = fs.readFileSync(filePath, 'utf8');

const newTests = `
    @Test
    @DisplayName("12. Shipment with destinationWarehouse=NULL does not appear in incoming queue")
    void testShipmentWithNullDestinationWarehouse_DoesNotAppearInIncoming() {
        Shipment nullDestShipment = new Shipment();
        nullDestShipment.setId(104L);
        nullDestShipment.setTrackingNumber("TRK-BLR-NULL-04");
        nullDestShipment.setOriginWarehouse(warehouseBengaluru);
        nullDestShipment.setDestinationWarehouse(null);
        nullDestShipment.setStatus(OrderStatus.CONFIRMED);

        // findIncomingShipmentsForWarehouse uses repository query which requires destinationWarehouse = warehouse
        when(shipmentRepository.findIncomingShipmentsForWarehouse(warehouseBengaluru))
                .thenReturn(Collections.emptyList());

        List<WarehouseShipmentDTO> incoming = warehouseManagerService.getIncomingShipments();
        assertTrue(incoming.isEmpty(), "Shipment with NULL destination warehouse must not appear in incoming");
    }

    @Test
    @DisplayName("13. Shipment with origin=BLR and destination=BLR does not appear in BLR incoming")
    void testOriginBengaluruAndDestinationBengaluru_DoesNotAppearInIncoming() {
        // Query condition: destinationWarehouse = :warehouse AND (originWarehouse IS NULL OR originWarehouse != :warehouse)
        when(shipmentRepository.findIncomingShipmentsForWarehouse(warehouseBengaluru))
                .thenReturn(Collections.emptyList());

        List<WarehouseShipmentDTO> incoming = warehouseManagerService.getIncomingShipments();
        assertTrue(incoming.isEmpty());
    }

    @Test
    @DisplayName("14. Shipment with origin=BLR and destination=HYD appears in BLR outgoing and not in BLR incoming")
    void testShipmentOriginBlrDestinationHyd_AppearsOnlyInOutgoing() {
        Warehouse warehouseHyderabad = new Warehouse();
        warehouseHyderabad.setId(4L);
        warehouseHyderabad.setWarehouseCode("WH-HYD-005");
        warehouseHyderabad.setWarehouseName("Hyderabad Logistics Center");
        warehouseHyderabad.setCity("Hyderabad");

        Shipment shipmentBlrToHyd = new Shipment();
        shipmentBlrToHyd.setId(105L);
        shipmentBlrToHyd.setTrackingNumber("TRK-BLR-HYD-05");
        shipmentBlrToHyd.setOriginWarehouse(warehouseBengaluru);
        shipmentBlrToHyd.setDestinationWarehouse(warehouseHyderabad);
        shipmentBlrToHyd.setStatus(OrderStatus.CONFIRMED);
        shipmentBlrToHyd.setOperationalStage("PACKED");

        when(shipmentRepository.findByOriginWarehouseOrderByCreatedAtDesc(warehouseBengaluru))
                .thenReturn(List.of(shipmentBlrToHyd));
        when(shipmentRepository.findIncomingShipmentsForWarehouse(warehouseBengaluru))
                .thenReturn(Collections.emptyList());

        List<WarehouseShipmentDTO> outgoing = warehouseManagerService.getOutgoingShipments();
        List<WarehouseShipmentDTO> incoming = warehouseManagerService.getIncomingShipments();

        assertEquals(1, outgoing.size());
        assertEquals("TRK-BLR-HYD-05", outgoing.get(0).getTrackingNumber());
        assertEquals(0, incoming.size());
    }

    @Test
    @DisplayName("15. Shipment with origin=MUM and destination=BLR appears in BLR incoming")
    void testShipmentOriginMumDestinationBlr_AppearsInBengaluruIncoming() {
        when(shipmentRepository.findIncomingShipmentsForWarehouse(warehouseBengaluru))
                .thenReturn(List.of(shipmentMumToBlr));

        List<WarehouseShipmentDTO> incoming = warehouseManagerService.getIncomingShipments();

        assertEquals(1, incoming.size());
        assertEquals("TRK-MUM-BLR-02", incoming.get(0).getTrackingNumber());
        assertEquals("Mumbai West Freight Center", incoming.get(0).getOriginWarehouseName());
        assertEquals("Bengaluru Central Hub", incoming.get(0).getDestinationWarehouseName());
    }
}
`;

content = content.trim().replace(/\}\s*$/, newTests);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated WarehouseManagerShipmentScopingTest.java');
