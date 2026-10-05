const fs = require('fs');
const path = require('path');
const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

const f = path.join(BACKEND_DIR, 'src/test/java/com/primeroute/logistics/service/FulfillmentEngineServiceTest.java');
const content = fs.readFileSync(f, 'utf8');

const additionalTests = `
    @Test
    @DisplayName("ROUTING TEST 4: Pickup Bengaluru + Delivery Kolkata with SAME_DAY delivery -> MUST allocate Bengaluru WH-BLR-001")
    void testPickupBengaluruDeliveryKolkata_SameDay_AllocatesBengaluruOrigin() {
        Order order = new Order();
        order.setOrderNumber("PR-ORD-96307644");
        order.setPickupAddress(pickupAddressBengaluru);
        order.setDeliveryAddress(deliveryAddressKolkata);
        order.setDeliveryType(DeliveryType.SAME_DAY);
        order.setPackageWeight(3.0);

        OrderItem item = new OrderItem(order, productA, 1, productA.getUnitWeight(), productA.getUnitPrice());
        order.addItem(item);

        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(List.of(whBengaluru, whKolkata));
        when(inventoryRepository.findByWarehouseAndProduct(whBengaluru, productA))
                .thenReturn(Optional.of(createInventory(whBengaluru, productA, 50, 0, 0)));

        FulfillmentEvaluationResultDTO result = fulfillmentEngineService.evaluateOrder(order);

        assertNotNull(result);
        assertEquals(FulfillmentAllocationStatus.ALLOCATED, result.getAllocationStatus());
        assertEquals(whBengaluru.getId(), result.getSelectedWarehouseId(), "Origin warehouse MUST be Bengaluru for Bengaluru pickup regardless of SAME_DAY to Kolkata");
        assertEquals("WH-BLR-001", result.getSelectedWarehouseCode());
    }

    @Test
    @DisplayName("ROUTING TEST 5: Pickup Kolkata + Delivery Bengaluru with SAME_DAY delivery -> MUST allocate Kolkata WH-CCU-006")
    void testPickupKolkataDeliveryBengaluru_SameDay_AllocatesKolkataOrigin() {
        Order order = new Order();
        order.setOrderNumber("PR-ORD-CCU-SAME-01");
        order.setPickupAddress(pickupAddressKolkata);
        order.setDeliveryAddress(deliveryAddressBengaluru);
        order.setDeliveryType(DeliveryType.SAME_DAY);
        order.setPackageWeight(3.0);

        OrderItem item = new OrderItem(order, productA, 1, productA.getUnitWeight(), productA.getUnitPrice());
        order.addItem(item);

        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(List.of(whBengaluru, whKolkata));
        when(inventoryRepository.findByWarehouseAndProduct(whKolkata, productA))
                .thenReturn(Optional.of(createInventory(whKolkata, productA, 50, 0, 0)));

        FulfillmentEvaluationResultDTO result = fulfillmentEngineService.evaluateOrder(order);

        assertNotNull(result);
        assertEquals(FulfillmentAllocationStatus.ALLOCATED, result.getAllocationStatus());
        assertEquals(whKolkata.getId(), result.getSelectedWarehouseId(), "Origin warehouse MUST be Kolkata for Kolkata pickup");
        assertEquals("WH-CCU-006", result.getSelectedWarehouseCode());
    }

    @Test
    @DisplayName("ROUTING TEST 6: Pickup Bengaluru + Delivery Cuttack -> Origin MUST be Bengaluru WH-BLR-001")
    void testPickupBengaluruDeliveryCuttack_AllocatesBengaluruOrigin() {
        Address deliveryAddressCuttack = createAddress("Cuttack", "Odisha", "753001");

        Order order = new Order();
        order.setOrderNumber("PR-ORD-BLR-CTC-01");
        order.setPickupAddress(pickupAddressBengaluru);
        order.setDeliveryAddress(deliveryAddressCuttack);
        order.setPackageWeight(2.0);

        OrderItem item = new OrderItem(order, productA, 1, productA.getUnitWeight(), productA.getUnitPrice());
        order.addItem(item);

        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(List.of(whBengaluru, whKolkata));
        when(inventoryRepository.findByWarehouseAndProduct(whBengaluru, productA))
                .thenReturn(Optional.of(createInventory(whBengaluru, productA, 50, 0, 0)));

        FulfillmentEvaluationResultDTO result = fulfillmentEngineService.evaluateOrder(order);

        assertNotNull(result);
        assertEquals(FulfillmentAllocationStatus.ALLOCATED, result.getAllocationStatus());
        assertEquals(whBengaluru.getId(), result.getSelectedWarehouseId());
        assertEquals("WH-BLR-001", result.getSelectedWarehouseCode());
    }

    @Test
    @DisplayName("ROUTING TEST 7: Pickup Kolkata + Delivery Cuttack -> Origin MUST be Kolkata WH-CCU-006")
    void testPickupKolkataDeliveryCuttack_AllocatesKolkataOrigin() {
        Address deliveryAddressCuttack = createAddress("Cuttack", "Odisha", "753001");

        Order order = new Order();
        order.setOrderNumber("PR-ORD-CCU-CTC-01");
        order.setPickupAddress(pickupAddressKolkata);
        order.setDeliveryAddress(deliveryAddressCuttack);
        order.setPackageWeight(2.0);

        OrderItem item = new OrderItem(order, productA, 1, productA.getUnitWeight(), productA.getUnitPrice());
        order.addItem(item);

        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(List.of(whBengaluru, whKolkata));
        when(inventoryRepository.findByWarehouseAndProduct(whKolkata, productA))
                .thenReturn(Optional.of(createInventory(whKolkata, productA, 50, 0, 0)));

        FulfillmentEvaluationResultDTO result = fulfillmentEngineService.evaluateOrder(order);

        assertNotNull(result);
        assertEquals(FulfillmentAllocationStatus.ALLOCATED, result.getAllocationStatus());
        assertEquals(whKolkata.getId(), result.getSelectedWarehouseId());
        assertEquals("WH-CCU-006", result.getSelectedWarehouseCode());
    }

    @Test
    @DisplayName("ROUTING TEST 8: Pickup Banglore variants ('Banglore', '560037', 'Marathahalli') -> Origin MUST be Bengaluru WH-BLR-001")
    void testPickupBangloreVariant_AllocatesBengaluruOrigin() {
        Address pickupVariant = createAddress("Banglore", "Karnataka", "560037");
        pickupVariant.setAddressLine1("Maa bhubaneswari ladies pg");
        pickupVariant.setAddressLine2("Marathahalli,Banglore");

        Order order = new Order();
        order.setOrderNumber("PR-ORD-96307644-VAR");
        order.setPickupAddress(pickupVariant);
        order.setDeliveryAddress(deliveryAddressKolkata);
        order.setDeliveryType(DeliveryType.SAME_DAY);

        OrderItem item = new OrderItem(order, productA, 1, productA.getUnitWeight(), productA.getUnitPrice());
        order.addItem(item);

        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(List.of(whBengaluru, whKolkata));
        when(inventoryRepository.findByWarehouseAndProduct(whBengaluru, productA))
                .thenReturn(Optional.of(createInventory(whBengaluru, productA, 50, 0, 0)));

        FulfillmentEvaluationResultDTO result = fulfillmentEngineService.evaluateOrder(order);

        assertNotNull(result);
        assertEquals(FulfillmentAllocationStatus.ALLOCATED, result.getAllocationStatus());
        assertEquals(whBengaluru.getId(), result.getSelectedWarehouseId());
        assertEquals("WH-BLR-001", result.getSelectedWarehouseCode());
    }
}
`;

const updatedContent = content.replace(/\n\}\s*$/, additionalTests);
fs.writeFileSync(f, updatedContent, 'utf8');
console.log('Updated FulfillmentEngineServiceTest.java successfully.');
