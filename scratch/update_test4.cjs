const fs = require('fs');
const path = require('path');
const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

const f = path.join(BACKEND_DIR, 'src/test/java/com/primeroute/logistics/service/FulfillmentEngineServiceTest.java');
let content = fs.readFileSync(f, 'utf8');

const oldTest4 = `    @Test
    @DisplayName("TEST 4: Same-Day SLA fails when warehouse is not local to delivery address")
    void testSameDaySlaViolation() {
        Order order = new Order();
        order.setOrderNumber("PR-ORD-00000004");
        order.setPickupAddress(pickupAddressMumbai);
        order.setDeliveryAddress(deliveryAddressDelhi); // Delhi delivery from Mumbai warehouse
        order.setDeliveryType(DeliveryType.SAME_DAY);
        order.setPackageWeight(1.0);

        OrderItem item = new OrderItem(order, productA, 1, productA.getUnitWeight(), productA.getUnitPrice());
        order.addItem(item);

        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(List.of(whMumbai));
        when(inventoryRepository.findByWarehouseAndProduct(whMumbai, productA))
                .thenReturn(Optional.of(createInventory(whMumbai, productA, 10, 0, 0)));

        FulfillmentEvaluationResultDTO result = fulfillmentEngineService.evaluateOrder(order);

        assertNotNull(result);
        assertEquals(FulfillmentAllocationStatus.EXCEPTION, result.getAllocationStatus());
        assertEquals("SLA_UNAVAILABLE", result.getReason());
    }`;

const newTest4 = `    @Test
    @DisplayName("TEST 4: Same-Day order allocates to origin warehouse based strictly on pickup location")
    void testSameDaySlaViolation() {
        Order order = new Order();
        order.setOrderNumber("PR-ORD-00000004");
        order.setPickupAddress(pickupAddressMumbai);
        order.setDeliveryAddress(deliveryAddressDelhi); // Delhi delivery from Mumbai pickup
        order.setDeliveryType(DeliveryType.SAME_DAY);
        order.setPackageWeight(1.0);

        OrderItem item = new OrderItem(order, productA, 1, productA.getUnitWeight(), productA.getUnitPrice());
        order.addItem(item);

        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(List.of(whMumbai));
        when(inventoryRepository.findByWarehouseAndProduct(whMumbai, productA))
                .thenReturn(Optional.of(createInventory(whMumbai, productA, 10, 0, 0)));

        FulfillmentEvaluationResultDTO result = fulfillmentEngineService.evaluateOrder(order);

        assertNotNull(result);
        assertEquals(FulfillmentAllocationStatus.ALLOCATED, result.getAllocationStatus());
        assertEquals(whMumbai.getId(), result.getSelectedWarehouseId());
    }`;

content = content.replace(oldTest4, newTest4);
fs.writeFileSync(f, content, 'utf8');
console.log('Updated Test 4 in FulfillmentEngineServiceTest.java');
