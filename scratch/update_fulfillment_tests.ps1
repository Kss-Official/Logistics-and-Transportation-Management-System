$content = @'
package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.FulfillmentEvaluationResultDTO;
import com.primeroute.logistics.entity.*;
import com.primeroute.logistics.repository.InventoryRepository;
import com.primeroute.logistics.repository.WarehouseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class FulfillmentEngineServiceTest {

    @Mock
    private WarehouseRepository warehouseRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @InjectMocks
    private FulfillmentEngineService fulfillmentEngineService;

    private Warehouse whMumbai;
    private Warehouse whDelhi;
    private Warehouse whBengaluru;
    private Warehouse whKolkata;
    private Product productA;
    private Product productB;

    private Address pickupAddressMumbai;
    private Address deliveryAddressMumbai;
    private Address deliveryAddressDelhi;
    private Address pickupAddressKolkata;
    private Address deliveryAddressBengaluru;
    private Address pickupAddressBengaluru;
    private Address deliveryAddressKolkata;
    private Address deliveryAddressChennai;
    private Address pickupAddressCuttack;

    @BeforeEach
    void setUp() {
        whMumbai = new Warehouse();
        whMumbai.setId(1L);
        whMumbai.setWarehouseCode("WH-MUM-01");
        whMumbai.setWarehouseName("Mumbai Central Logistics Hub");
        whMumbai.setCity("Mumbai");
        whMumbai.setState("Maharashtra");
        whMumbai.setStatus(WarehouseStatus.ACTIVE);
        whMumbai.setTotalCapacity(1000.0);
        whMumbai.setOccupiedCapacity(200.0);
        whMumbai.setCapacityUnit("TONS");
        whMumbai.setLatitude(19.0760);
        whMumbai.setLongitude(72.8777);

        whDelhi = new Warehouse();
        whDelhi.setId(2L);
        whDelhi.setWarehouseCode("WH-DEL-01");
        whDelhi.setWarehouseName("Delhi NCR Mega Warehouse");
        whDelhi.setCity("Delhi");
        whDelhi.setState("Delhi");
        whDelhi.setStatus(WarehouseStatus.ACTIVE);
        whDelhi.setTotalCapacity(500.0);
        whDelhi.setOccupiedCapacity(100.0);
        whDelhi.setCapacityUnit("TONS");
        whDelhi.setLatitude(28.6139);
        whDelhi.setLongitude(77.2090);

        whBengaluru = new Warehouse();
        whBengaluru.setId(10L);
        whBengaluru.setWarehouseCode("WH-BLR-001");
        whBengaluru.setWarehouseName("Bengaluru Central Hub");
        whBengaluru.setCity("Bengaluru");
        whBengaluru.setState("Karnataka");
        whBengaluru.setStatus(WarehouseStatus.ACTIVE);
        whBengaluru.setTotalCapacity(1000.0);
        whBengaluru.setOccupiedCapacity(150.0);
        whBengaluru.setCapacityUnit("TONS");
        whBengaluru.setLatitude(12.9716);
        whBengaluru.setLongitude(77.5946);

        whKolkata = new Warehouse();
        whKolkata.setId(60L);
        whKolkata.setWarehouseCode("WH-CCU-006");
        whKolkata.setWarehouseName("Kolkata Eastern Corridor Hub");
        whKolkata.setCity("Kolkata");
        whKolkata.setState("West Bengal");
        whKolkata.setStatus(WarehouseStatus.ACTIVE);
        whKolkata.setTotalCapacity(800.0);
        whKolkata.setOccupiedCapacity(120.0);
        whKolkata.setCapacityUnit("TONS");
        whKolkata.setLatitude(22.5726);
        whKolkata.setLongitude(88.3639);

        productA = new Product("SKU-ELEC-001", "Smartphone Pro", "Electronics", 0.5, 49999.0, "Units", 10);
        productA.setId(101L);

        productB = new Product("SKU-ELEC-002", "Wireless Headphones", "Electronics", 0.3, 4999.0, "Units", 10);
        productB.setId(102L);

        pickupAddressMumbai = new Address();
        pickupAddressMumbai.setCity("Mumbai");
        pickupAddressMumbai.setState("Maharashtra");
        pickupAddressMumbai.setPostalCode("400001");
        pickupAddressMumbai.setLatitude(19.0760);
        pickupAddressMumbai.setLongitude(72.8777);

        deliveryAddressMumbai = new Address();
        deliveryAddressMumbai.setCity("Mumbai");
        deliveryAddressMumbai.setState("Maharashtra");
        deliveryAddressMumbai.setPostalCode("400001");
        deliveryAddressMumbai.setLatitude(19.0760);
        deliveryAddressMumbai.setLongitude(72.8777);

        deliveryAddressDelhi = new Address();
        deliveryAddressDelhi.setCity("Delhi");
        deliveryAddressDelhi.setState("Delhi");
        deliveryAddressDelhi.setPostalCode("110001");
        deliveryAddressDelhi.setLatitude(28.6139);
        deliveryAddressDelhi.setLongitude(77.2090);

        pickupAddressKolkata = new Address();
        pickupAddressKolkata.setAddressLine1("11, Netaji Subhas Road, Hare Street");
        pickupAddressKolkata.setCity("Kolkata");
        pickupAddressKolkata.setState("West Bengal");
        pickupAddressKolkata.setPostalCode("700001");
        pickupAddressKolkata.setLatitude(22.5726);
        pickupAddressKolkata.setLongitude(88.3639);

        deliveryAddressBengaluru = new Address();
        deliveryAddressBengaluru.setAddressLine1("Maa bhubaneswari ladies pg, Marathahalli");
        deliveryAddressBengaluru.setCity("Bangalore");
        deliveryAddressBengaluru.setState("Karnataka");
        deliveryAddressBengaluru.setPostalCode("560037");
        deliveryAddressBengaluru.setLatitude(12.9716);
        deliveryAddressBengaluru.setLongitude(77.5946);

        pickupAddressBengaluru = new Address();
        pickupAddressBengaluru.setAddressLine1("Plot 42, Export Promotion Industrial Park, Whitefield");
        pickupAddressBengaluru.setCity("Bengaluru");
        pickupAddressBengaluru.setState("Karnataka");
        pickupAddressBengaluru.setPostalCode("560066");
        pickupAddressBengaluru.setLatitude(12.9716);
        pickupAddressBengaluru.setLongitude(77.5946);

        deliveryAddressKolkata = new Address();
        deliveryAddressKolkata.setAddressLine1("Salt Lake Sector V");
        deliveryAddressKolkata.setCity("Kolkata");
        deliveryAddressKolkata.setState("West Bengal");
        deliveryAddressKolkata.setPostalCode("700091");
        deliveryAddressKolkata.setLatitude(22.5726);
        deliveryAddressKolkata.setLongitude(88.3639);

        deliveryAddressChennai = new Address();
        deliveryAddressChennai.setAddressLine1("Anna Salai, Guindy");
        deliveryAddressChennai.setCity("Chennai");
        deliveryAddressChennai.setState("Tamil Nadu");
        deliveryAddressChennai.setPostalCode("600032");
        deliveryAddressChennai.setLatitude(13.0827);
        deliveryAddressChennai.setLongitude(80.2707);

        pickupAddressCuttack = new Address();
        pickupAddressCuttack.setAddressLine1("Badambadi Bus Stand Road");
        pickupAddressCuttack.setCity("Cuttack");
        pickupAddressCuttack.setState("Odisha");
        pickupAddressCuttack.setPostalCode("753001");
        pickupAddressCuttack.setLatitude(20.4625);
        pickupAddressCuttack.setLongitude(85.8830);
    }

    private Inventory createInventory(Warehouse wh, Product prod, int total, int reserved, int damaged) {
        Inventory inv = new Inventory();
        inv.setWarehouse(wh);
        inv.setProduct(prod);
        inv.setSku(prod.getSku());
        inv.setProductName(prod.getName());
        inv.setCategory(prod.getCategory());
        inv.setTotalStock(total);
        inv.setReservedStock(reserved);
        inv.setDamagedStock(damaged);
        inv.recalculate();
        return inv;
    }

    // =========================================================
    // TEST 1: Active warehouse + sufficient inventory -> ALLOCATED
    // =========================================================
    @Test
    @DisplayName("TEST 1: Active warehouse with sufficient inventory qualifies for allocation")
    void testActiveWarehouseWithSufficientInventory() {
        Order order = new Order();
        order.setOrderNumber("PR-ORD-00000001");
        order.setPickupAddress(pickupAddressMumbai);
        order.setDeliveryAddress(deliveryAddressMumbai);
        order.setPackageWeight(2.5);
        order.setDeliveryType(DeliveryType.STANDARD);

        OrderItem item = new OrderItem(order, productA, 5, productA.getUnitWeight(), productA.getUnitPrice());
        order.addItem(item);

        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(List.of(whMumbai));
        when(inventoryRepository.findByWarehouseAndProduct(whMumbai, productA))
                .thenReturn(Optional.of(createInventory(whMumbai, productA, 50, 5, 0)));

        FulfillmentEvaluationResultDTO result = fulfillmentEngineService.evaluateOrder(order);

        assertNotNull(result);
        assertEquals(FulfillmentAllocationStatus.ALLOCATED, result.getAllocationStatus());
        assertEquals(whMumbai.getId(), result.getSelectedWarehouseId());
        assertEquals(whMumbai.getWarehouseCode(), result.getSelectedWarehouseCode());
        assertEquals(1, result.getEligibleWarehouseCount());
        assertTrue(result.getAllocationScore() > 100.0);
    }

    // =========================================================
    // TEST 2: Inactive warehouse excluded
    // =========================================================
    @Test
    @DisplayName("TEST 2: Inactive warehouses are never queried or returned")
    void testInactiveWarehouseExcluded() {
        Order order = new Order();
        order.setOrderNumber("PR-ORD-00000002");
        order.setPickupAddress(pickupAddressMumbai);
        order.setDeliveryAddress(deliveryAddressMumbai);
        order.setPackageWeight(1.0);

        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(Collections.emptyList());

        FulfillmentEvaluationResultDTO result = fulfillmentEngineService.evaluateOrder(order);

        assertNotNull(result);
        assertEquals(FulfillmentAllocationStatus.EXCEPTION, result.getAllocationStatus());
        assertEquals("NO_ACTIVE_WAREHOUSES", result.getReason());
        assertNull(result.getSelectedWarehouseId());
    }

    // =========================================================
    // TEST 3: Capacity exceeded -> EXCEPTION
    // =========================================================
    @Test
    @DisplayName("TEST 3: Physical capacity check excludes warehouse with insufficient headroom")
    void testCapacityExceededCausesException() {
        whMumbai.setTotalCapacity(10.0);
        whMumbai.setOccupiedCapacity(9.5); // 0.5 ton = 500kg free

        Order order = new Order();
        order.setOrderNumber("PR-ORD-00000003");
        order.setPickupAddress(pickupAddressMumbai);
        order.setDeliveryAddress(deliveryAddressMumbai);
        order.setPackageWeight(600.0); // 600kg > 500kg free

        OrderItem item = new OrderItem(order, productA, 1, 600.0, 100.0);
        order.addItem(item);

        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(List.of(whMumbai));
        when(inventoryRepository.findByWarehouseAndProduct(whMumbai, productA))
                .thenReturn(Optional.of(createInventory(whMumbai, productA, 10, 0, 0)));

        FulfillmentEvaluationResultDTO result = fulfillmentEngineService.evaluateOrder(order);

        assertNotNull(result);
        assertEquals(FulfillmentAllocationStatus.EXCEPTION, result.getAllocationStatus());
        assertEquals("CAPACITY_UNAVAILABLE", result.getReason());
    }

    // =========================================================
    // TEST 4: SAME_DAY SLA violation -> EXCEPTION
    // =========================================================
    @Test
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
    }

    // =========================================================
    // TEST 5: Out of Origin Service Area -> EXCEPTION
    // =========================================================
    @Test
    @DisplayName("TEST 5: Out of service area pickup (e.g. Cuttack without local hub) results in EXCEPTION")
    void testOutOfServiceAreaCausesException() {
        Order order = new Order();
        order.setOrderNumber("PR-ORD-00000005");
        order.setPickupAddress(pickupAddressCuttack);
        order.setDeliveryAddress(deliveryAddressBengaluru);
        order.setPackageWeight(2.0);

        OrderItem item = new OrderItem(order, productA, 1, 2.0, 1000.0);
        order.addItem(item);

        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(List.of(whBengaluru, whKolkata));

        FulfillmentEvaluationResultDTO result = fulfillmentEngineService.evaluateOrder(order);

        assertNotNull(result);
        assertEquals(FulfillmentAllocationStatus.EXCEPTION, result.getAllocationStatus());
        assertEquals("NO_ELIGIBLE_WAREHOUSE_FOR_ORIGIN", result.getReason());
        assertNull(result.getSelectedWarehouseId());
    }

    // =========================================================
    // TEST 6: Multiple items all stocked -> ALLOCATED
    // =========================================================
    @Test
    @DisplayName("TEST 6: Multi-item order succeeds only when ALL items are stocked at the same warehouse")
    void testMultiItemAllStockedAllocates() {
        Order order = new Order();
        order.setOrderNumber("PR-ORD-00000006");
        order.setPickupAddress(pickupAddressMumbai);
        order.setDeliveryAddress(deliveryAddressMumbai);
        order.setPackageWeight(1.0);

        OrderItem item1 = new OrderItem(order, productA, 2, productA.getUnitWeight(), productA.getUnitPrice());
        OrderItem item2 = new OrderItem(order, productB, 3, productB.getUnitWeight(), productB.getUnitPrice());
        order.addItem(item1);
        order.addItem(item2);

        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(List.of(whMumbai));
        when(inventoryRepository.findByWarehouseAndProduct(whMumbai, productA))
                .thenReturn(Optional.of(createInventory(whMumbai, productA, 20, 0, 0)));
        when(inventoryRepository.findByWarehouseAndProduct(whMumbai, productB))
                .thenReturn(Optional.of(createInventory(whMumbai, productB, 30, 0, 0)));

        FulfillmentEvaluationResultDTO result = fulfillmentEngineService.evaluateOrder(order);

        assertNotNull(result);
        assertEquals(FulfillmentAllocationStatus.ALLOCATED, result.getAllocationStatus());
        assertEquals(whMumbai.getId(), result.getSelectedWarehouseId());
    }

    // =========================================================
    // TEST 7: Insufficient stock for one item -> EXCEPTION
    // =========================================================
    @Test
    @DisplayName("TEST 7: Insufficient stock for any item in order causes INSUFFICIENT_INVENTORY")
    void testInsufficientStockCausesException() {
        Order order = new Order();
        order.setOrderNumber("PR-ORD-00000007");
        order.setPickupAddress(pickupAddressMumbai);
        order.setDeliveryAddress(deliveryAddressMumbai);
        order.setPackageWeight(1.0);

        OrderItem item = new OrderItem(order, productA, 10, productA.getUnitWeight(), productA.getUnitPrice());
        order.addItem(item);

        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(List.of(whMumbai));
        when(inventoryRepository.findByWarehouseAndProduct(whMumbai, productA))
                .thenReturn(Optional.of(createInventory(whMumbai, productA, 5, 2, 0))); // Only 3 available

        FulfillmentEvaluationResultDTO result = fulfillmentEngineService.evaluateOrder(order);

        assertNotNull(result);
        assertEquals(FulfillmentAllocationStatus.EXCEPTION, result.getAllocationStatus());
        assertEquals("INSUFFICIENT_INVENTORY", result.getReason());
        assertEquals(0, result.getEligibleWarehouseCount());
    }

    // =========================================================
    // TEST 8: Haversine distance calculation is accurate
    // =========================================================
    @Test
    @DisplayName("TEST 8: Haversine distance calculation is accurate between coordinates")
    void testHaversineCalculationAccuracy() {
        // Mumbai coordinates: 19.0760, 72.8777
        // Delhi coordinates: 28.6139, 77.2090
        Double distance = fulfillmentEngineService.calculateHaversineDistance(19.0760, 72.8777, 28.6139, 77.2090);

        assertNotNull(distance);
        assertTrue(distance > 1140.0 && distance < 1170.0, "Expected distance around 1150-1160 km, got: " + distance);
    }

    // =========================================================
    // AUTHORITATIVE ROUTING TESTS (KOLKATA <-> BENGALURU)
    // =========================================================

    @Test
    @DisplayName("ROUTING TEST 1: Pickup Kolkata + Delivery Bengaluru -> Origin Warehouse MUST be Kolkata Eastern Hub")
    void testPickupKolkataDeliveryBengaluru_AllocatesKolkataOrigin() {
        Order order = new Order();
        order.setOrderNumber("PR-ORD-76406402");
        order.setPickupAddress(pickupAddressKolkata);
        order.setDeliveryAddress(deliveryAddressBengaluru);
        order.setPackageWeight(3.0);

        OrderItem item = new OrderItem(order, productA, 1, productA.getUnitWeight(), productA.getUnitPrice());
        order.addItem(item);

        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(List.of(whBengaluru, whKolkata));
        when(inventoryRepository.findByWarehouseAndProduct(whKolkata, productA))
                .thenReturn(Optional.of(createInventory(whKolkata, productA, 50, 0, 0)));

        FulfillmentEvaluationResultDTO result = fulfillmentEngineService.evaluateOrder(order);

        assertNotNull(result);
        assertEquals(FulfillmentAllocationStatus.ALLOCATED, result.getAllocationStatus());
        assertEquals(whKolkata.getId(), result.getSelectedWarehouseId(), "Origin warehouse MUST be Kolkata because pickup is Kolkata");
        assertEquals("WH-CCU-006", result.getSelectedWarehouseCode());
    }

    @Test
    @DisplayName("ROUTING TEST 2: Pickup Bengaluru + Delivery Kolkata -> Origin Warehouse MUST be Bengaluru Central Hub")
    void testPickupBengaluruDeliveryKolkata_AllocatesBengaluruOrigin() {
        Order order = new Order();
        order.setOrderNumber("PR-ORD-REV00001");
        order.setPickupAddress(pickupAddressBengaluru);
        order.setDeliveryAddress(deliveryAddressKolkata);
        order.setPackageWeight(3.0);

        OrderItem item = new OrderItem(order, productA, 1, productA.getUnitWeight(), productA.getUnitPrice());
        order.addItem(item);

        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(List.of(whBengaluru, whKolkata));
        when(inventoryRepository.findByWarehouseAndProduct(whBengaluru, productA))
                .thenReturn(Optional.of(createInventory(whBengaluru, productA, 50, 0, 0)));

        FulfillmentEvaluationResultDTO result = fulfillmentEngineService.evaluateOrder(order);

        assertNotNull(result);
        assertEquals(FulfillmentAllocationStatus.ALLOCATED, result.getAllocationStatus());
        assertEquals(whBengaluru.getId(), result.getSelectedWarehouseId(), "Origin warehouse MUST be Bengaluru because pickup is Bengaluru");
        assertEquals("WH-BLR-001", result.getSelectedWarehouseCode());
    }

    @Test
    @DisplayName("ROUTING TEST 3: Destination Invariance - Changing delivery to Chennai/Delhi/Bengaluru retains Kolkata Origin")
    void testDestinationInvarianceRetainsKolkataOrigin() {
        // Order 1: Kolkata -> Bengaluru
        Order order1 = new Order();
        order1.setOrderNumber("PR-ORD-INVAR-01");
        order1.setPickupAddress(pickupAddressKolkata);
        order1.setDeliveryAddress(deliveryAddressBengaluru);
        order1.addItem(new OrderItem(order1, productA, 1, 1.0, 1000.0));

        // Order 2: Kolkata -> Chennai
        Order order2 = new Order();
        order2.setOrderNumber("PR-ORD-INVAR-02");
        order2.setPickupAddress(pickupAddressKolkata);
        order2.setDeliveryAddress(deliveryAddressChennai);
        order2.addItem(new OrderItem(order2, productA, 1, 1.0, 1000.0));

        // Order 3: Kolkata -> Delhi
        Order order3 = new Order();
        order3.setOrderNumber("PR-ORD-INVAR-03");
        order3.setPickupAddress(pickupAddressKolkata);
        order3.setDeliveryAddress(deliveryAddressDelhi);
        order3.addItem(new OrderItem(order3, productA, 1, 1.0, 1000.0));

        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(List.of(whBengaluru, whKolkata, whDelhi));
        when(inventoryRepository.findByWarehouseAndProduct(whKolkata, productA))
                .thenReturn(Optional.of(createInventory(whKolkata, productA, 50, 0, 0)));

        FulfillmentEvaluationResultDTO res1 = fulfillmentEngineService.evaluateOrder(order1);
        FulfillmentEvaluationResultDTO res2 = fulfillmentEngineService.evaluateOrder(order2);
        FulfillmentEvaluationResultDTO res3 = fulfillmentEngineService.evaluateOrder(order3);

        assertEquals(whKolkata.getId(), res1.getSelectedWarehouseId());
        assertEquals(whKolkata.getId(), res2.getSelectedWarehouseId());
        assertEquals(whKolkata.getId(), res3.getSelectedWarehouseId());
        assertEquals("WH-CCU-006", res1.getSelectedWarehouseCode());
        assertEquals("WH-CCU-006", res2.getSelectedWarehouseCode());
        assertEquals("WH-CCU-006", res3.getSelectedWarehouseCode());
    }
}
'@

[System.IO.File]::WriteAllText('C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management\src\test\java\com\primeroute\logistics\service\FulfillmentEngineServiceTest.java', $content, [System.Text.Encoding]::UTF8)
Write-Host "FulfillmentEngineServiceTest.java written."
