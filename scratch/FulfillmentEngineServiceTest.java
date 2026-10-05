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

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
    private Address deliveryAddressMumbai;
    private Address deliveryAddressDelhi;
    private Address pickupAddressKolkata;
    private Address deliveryAddressBengaluru;
    private Address pickupAddressBengaluru;
    private Address deliveryAddressKolkata;

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
        pickupAddressKolkata.setAddressLine1("Plot 42, Export Freight Terminal");
        pickupAddressKolkata.setCity("Kolkata");
        pickupAddressKolkata.setState("West Bengal");
        pickupAddressKolkata.setPostalCode("700001");
        pickupAddressKolkata.setLatitude(22.5726);
        pickupAddressKolkata.setLongitude(88.3639);

        deliveryAddressBengaluru = new Address();
        deliveryAddressBengaluru.setAddressLine1("Electronic City Phase 1");
        deliveryAddressBengaluru.setCity("Bengaluru");
        deliveryAddressBengaluru.setState("Karnataka");
        deliveryAddressBengaluru.setPostalCode("560100");
        deliveryAddressBengaluru.setLatitude(12.9716);
        deliveryAddressBengaluru.setLongitude(77.5946);

        pickupAddressBengaluru = new Address();
        pickupAddressBengaluru.setAddressLine1("Whitefield Tech Hub");
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
    // TEST 2: Inactive warehouse -> excluded
    // =========================================================
    @Test
    @DisplayName("TEST 2: Inactive warehouses are completely excluded from candidate pool")
    void testInactiveWarehouseExcluded() {
        Order order = new Order();
        order.setOrderNumber("PR-ORD-00000002");
        order.setDeliveryAddress(deliveryAddressMumbai);

        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(Collections.emptyList());

        FulfillmentEvaluationResultDTO result = fulfillmentEngineService.evaluateOrder(order);

        assertNotNull(result);
        assertEquals(FulfillmentAllocationStatus.EXCEPTION, result.getAllocationStatus());
        assertEquals("NO_ACTIVE_WAREHOUSES", result.getReason());
    }

    // =========================================================
    // TEST 3: Insufficient inventory -> warehouse excluded
    // =========================================================
    @Test
    @DisplayName("TEST 3: Warehouse with insufficient available inventory is excluded")
    void testInsufficientInventoryExcluded() {
        Order order = new Order();
        order.setOrderNumber("PR-ORD-00000003");
        order.setDeliveryAddress(deliveryAddressMumbai);

        OrderItem item = new OrderItem(order, productA, 10, productA.getUnitWeight(), productA.getUnitPrice());
        order.addItem(item);

        // Warehouse has total 10, but 8 reserved -> available = 2 < 10 requested
        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(List.of(whMumbai));
        when(inventoryRepository.findByWarehouseAndProduct(whMumbai, productA))
                .thenReturn(Optional.of(createInventory(whMumbai, productA, 10, 8, 0)));

        FulfillmentEvaluationResultDTO result = fulfillmentEngineService.evaluateOrder(order);

        assertNotNull(result);
        assertEquals(FulfillmentAllocationStatus.EXCEPTION, result.getAllocationStatus());
        assertEquals("INSUFFICIENT_INVENTORY", result.getReason());
    }

    // =========================================================
    // TEST 4: Multi-item order -> all items must be available
    // =========================================================
    @Test
    @DisplayName("TEST 4: All line items must be fully available at the candidate warehouse")
    void testMultipleOrderItemsAllMustBeAvailable() {
        Order order = new Order();
        order.setOrderNumber("PR-ORD-00000004");
        order.setDeliveryAddress(deliveryAddressDelhi);

        OrderItem item1 = new OrderItem(order, productA, 2, productA.getUnitWeight(), productA.getUnitPrice());
        OrderItem item2 = new OrderItem(order, productB, 5, productB.getUnitWeight(), productB.getUnitPrice());
        order.addItem(item1);
        order.addItem(item2);

        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(List.of(whMumbai, whDelhi));

        // Mumbai has item 1 but NOT item 2
        when(inventoryRepository.findByWarehouseAndProduct(whMumbai, productA))
                .thenReturn(Optional.of(createInventory(whMumbai, productA, 50, 0, 0)));
        when(inventoryRepository.findByWarehouseAndProduct(whMumbai, productB))
                .thenReturn(Optional.empty());
        when(inventoryRepository.findByWarehouseAndSku(whMumbai, productB.getSku()))
                .thenReturn(Optional.empty());

        // Delhi has BOTH items
        when(inventoryRepository.findByWarehouseAndProduct(whDelhi, productA))
                .thenReturn(Optional.of(createInventory(whDelhi, productA, 20, 0, 0)));
        when(inventoryRepository.findByWarehouseAndProduct(whDelhi, productB))
                .thenReturn(Optional.of(createInventory(whDelhi, productB, 20, 0, 0)));

        FulfillmentEvaluationResultDTO result = fulfillmentEngineService.evaluateOrder(order);

        assertNotNull(result);
        assertEquals(FulfillmentAllocationStatus.ALLOCATED, result.getAllocationStatus());
        assertEquals(whDelhi.getId(), result.getSelectedWarehouseId());
        assertEquals(1, result.getEligibleWarehouseCount());
    }

    // =========================================================
    // TEST 5: Insufficient capacity -> warehouse excluded
    // =========================================================
    @Test
    @DisplayName("TEST 5: Warehouse with exceeded capacity is excluded")
    void testInsufficientCapacityExcluded() {
        Order order = new Order();
        order.setOrderNumber("PR-ORD-00000005");
        order.setDeliveryAddress(deliveryAddressMumbai);
        order.setPackageWeight(2000.0); // 2000 KG = 2 TONS

        OrderItem item = new OrderItem(order, productA, 1, 2000.0, 1000.0);
        order.addItem(item);

        // Mumbai capacity is full: total 1000, occupied 999.5 TONS. Adding 2 TONS exceeds 1000 TONS limit.
        whMumbai.setOccupiedCapacity(999.5);

        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(List.of(whMumbai));
        when(inventoryRepository.findByWarehouseAndProduct(whMumbai, productA))
                .thenReturn(Optional.of(createInventory(whMumbai, productA, 50, 0, 0)));

        FulfillmentEvaluationResultDTO result = fulfillmentEngineService.evaluateOrder(order);

        assertNotNull(result);
        assertEquals(FulfillmentAllocationStatus.EXCEPTION, result.getAllocationStatus());
        assertEquals("CAPACITY_UNAVAILABLE", result.getReason());
    }

    // =========================================================
    // TEST 6: Capacity unit conversion (KG vs TONS)
    // =========================================================
    @Test
    @DisplayName("TEST 6: Capacity units are accurately converted without silent mismatch")
    void testCapacityUnitConversion() {
        Order order = new Order();
        order.setOrderNumber("PR-ORD-00000006");
        order.setDeliveryAddress(deliveryAddressMumbai);
        order.setPackageWeight(500.0); // 500 KG = 0.5 TONS

        OrderItem item = new OrderItem(order, productA, 1, 500.0, 1000.0);
        order.addItem(item);

        // Warehouse capacity: 10.0 TONS, occupied 9.0 TONS. 9.0 + 0.5 = 9.5 <= 10.0 (Should FIT)
        whMumbai.setTotalCapacity(10.0);
        whMumbai.setOccupiedCapacity(9.0);
        whMumbai.setCapacityUnit("TONS");

        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(List.of(whMumbai));
        when(inventoryRepository.findByWarehouseAndProduct(whMumbai, productA))
                .thenReturn(Optional.of(createInventory(whMumbai, productA, 50, 0, 0)));

        FulfillmentEvaluationResultDTO result = fulfillmentEngineService.evaluateOrder(order);

        assertNotNull(result);
        assertEquals(FulfillmentAllocationStatus.ALLOCATED, result.getAllocationStatus());
        assertEquals(whMumbai.getId(), result.getSelectedWarehouseId());
    }

    // =========================================================
    // TEST 7: No eligible warehouse -> EXCEPTION
    // =========================================================
    @Test
    @DisplayName("TEST 7: When no warehouse qualifies, return EXCEPTION without throwing errors")
    void testNoEligibleWarehouseReturnsException() {
        Order order = new Order();
        order.setOrderNumber("PR-ORD-00000007");

        OrderItem item = new OrderItem(order, productA, 10, 1.0, 100.0);
        order.addItem(item);

        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(List.of(whMumbai));
        when(inventoryRepository.findByWarehouseAndProduct(whMumbai, productA))
                .thenReturn(Optional.of(createInventory(whMumbai, productA, 0, 0, 0)));

        FulfillmentEvaluationResultDTO result = fulfillmentEngineService.evaluateOrder(order);

        assertNotNull(result);
        assertEquals(FulfillmentAllocationStatus.EXCEPTION, result.getAllocationStatus());
        assertEquals("INSUFFICIENT_INVENTORY", result.getReason());
        assertEquals(0, result.getEligibleWarehouseCount());
    }

    // =========================================================
    // TEST 8: Two eligible warehouses -> deterministic ranking
    // =========================================================
    @Test
    @DisplayName("TEST 8: Multiple eligible warehouses are ranked deterministically by score and proximity")
    void testTwoEligibleWarehousesDeterministicRanking() {
        Order order = new Order();
        order.setOrderNumber("PR-ORD-00000008");
        order.setDeliveryAddress(deliveryAddressMumbai);
        order.setPackageWeight(5.0);

        OrderItem item = new OrderItem(order, productA, 2, productA.getUnitWeight(), productA.getUnitPrice());
        order.addItem(item);

        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(List.of(whDelhi, whMumbai));
        when(inventoryRepository.findByWarehouseAndProduct(whMumbai, productA))
                .thenReturn(Optional.of(createInventory(whMumbai, productA, 50, 0, 0)));
        when(inventoryRepository.findByWarehouseAndProduct(whDelhi, productA))
                .thenReturn(Optional.of(createInventory(whDelhi, productA, 50, 0, 0)));

        FulfillmentEvaluationResultDTO result = fulfillmentEngineService.evaluateOrder(order);

        assertNotNull(result);
        assertEquals(FulfillmentAllocationStatus.ALLOCATED, result.getAllocationStatus());
        // Mumbai is in the same city as delivery address (Mumbai) and closer, so Mumbai must rank #1
        assertEquals(whMumbai.getId(), result.getSelectedWarehouseId());
        assertEquals(2, result.getEligibleWarehouseCount());
        assertTrue(result.getAllocationScore() > 100.0);
    }

    // =========================================================
    // TEST 9: No coordinates -> distanceKm remains null
    // =========================================================
    @Test
    @DisplayName("TEST 9: When coordinates are missing, distanceKm is cleanly null without fabrication")
    void testNoCoordinatesDistanceIsNull() {
        Address addrWithoutCoords = new Address();
        addrWithoutCoords.setCity("Mumbai");
        addrWithoutCoords.setState("Maharashtra");
        addrWithoutCoords.setPostalCode("400001");
        addrWithoutCoords.setLatitude(null);
        addrWithoutCoords.setLongitude(null);

        Order order = new Order();
        order.setOrderNumber("PR-ORD-00000009");
        order.setDeliveryAddress(addrWithoutCoords);

        OrderItem item = new OrderItem(order, productA, 1, 1.0, 100.0);
        order.addItem(item);

        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(List.of(whMumbai));
        when(inventoryRepository.findByWarehouseAndProduct(whMumbai, productA))
                .thenReturn(Optional.of(createInventory(whMumbai, productA, 20, 0, 0)));

        FulfillmentEvaluationResultDTO result = fulfillmentEngineService.evaluateOrder(order);

        assertNotNull(result);
        assertEquals(FulfillmentAllocationStatus.ALLOCATED, result.getAllocationStatus());
        assertNull(result.getDistanceKm(), "Distance must be null when coordinates are not available");
    }

    // =========================================================
    // TEST 10: Coordinates exist -> accurate Haversine distance
    // =========================================================
    @Test
    @DisplayName("TEST 10: Haversine distance calculation is accurate between coordinates")
    void testHaversineCalculationAccuracy() {
        // Mumbai coordinates: 19.0760, 72.8777
        // Delhi coordinates: 28.6139, 77.2090
        // Expected distance: ~1150 - 1160 km
        Double distance = fulfillmentEngineService.calculateHaversineDistance(19.0760, 72.8777, 28.6139, 77.2090);

        assertNotNull(distance);
        assertTrue(distance > 1140.0 && distance < 1170.0, "Expected distance around 1150-1160 km, got: " + distance);
    }

    // =========================================================
    // ROUTING RULE TESTS (KOLKATA <-> BENGALURU)
    // =========================================================

    @Test
    @DisplayName("ROUTING TEST 1: Pickup Kolkata + Delivery Bengaluru -> Origin Warehouse is Kolkata Eastern Hub")
    void testPickupKolkataDeliveryBengaluru_AllocatesKolkataOrigin() {
        Order order = new Order();
        order.setOrderNumber("PR-ORD-19214882");
        order.setPickupAddress(pickupAddressKolkata);
        order.setDeliveryAddress(deliveryAddressBengaluru);
        order.setPackageWeight(3.0);

        OrderItem item = new OrderItem(order, productA, 1, productA.getUnitWeight(), productA.getUnitPrice());
        order.addItem(item);

        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(List.of(whBengaluru, whKolkata));
        when(inventoryRepository.findByWarehouseAndProduct(whBengaluru, productA))
                .thenReturn(Optional.of(createInventory(whBengaluru, productA, 50, 0, 0)));
        when(inventoryRepository.findByWarehouseAndProduct(whKolkata, productA))
                .thenReturn(Optional.of(createInventory(whKolkata, productA, 50, 0, 0)));

        FulfillmentEvaluationResultDTO result = fulfillmentEngineService.evaluateOrder(order);

        assertNotNull(result);
        assertEquals(FulfillmentAllocationStatus.ALLOCATED, result.getAllocationStatus());
        assertEquals(whKolkata.getId(), result.getSelectedWarehouseId(), "Origin warehouse MUST be Kolkata because pickup is Kolkata");
        assertEquals("WH-CCU-006", result.getSelectedWarehouseCode());
    }

    @Test
    @DisplayName("ROUTING TEST 2: Pickup Bengaluru + Delivery Kolkata -> Origin Warehouse is Bengaluru Central Hub")
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
        when(inventoryRepository.findByWarehouseAndProduct(whKolkata, productA))
                .thenReturn(Optional.of(createInventory(whKolkata, productA, 50, 0, 0)));

        FulfillmentEvaluationResultDTO result = fulfillmentEngineService.evaluateOrder(order);

        assertNotNull(result);
        assertEquals(FulfillmentAllocationStatus.ALLOCATED, result.getAllocationStatus());
        assertEquals(whBengaluru.getId(), result.getSelectedWarehouseId(), "Origin warehouse MUST be Bengaluru because pickup is Bengaluru");
        assertEquals("WH-BLR-001", result.getSelectedWarehouseCode());
    }

    @Test
    @DisplayName("ROUTING TEST 3: resolveWarehouseForAddress resolves delivery address to Destination Warehouse")
    void testResolveWarehouseForDeliveryAddress() {
        // Delivery in Bengaluru -> resolves to Bengaluru Hub
        Warehouse destBlr = fulfillmentEngineService.resolveWarehouseForAddress(deliveryAddressBengaluru, List.of(whBengaluru, whKolkata));
        assertEquals(whBengaluru.getId(), destBlr.getId());

        // Delivery in Kolkata -> resolves to Kolkata Hub
        Warehouse destCcu = fulfillmentEngineService.resolveWarehouseForAddress(deliveryAddressKolkata, List.of(whBengaluru, whKolkata));
        assertEquals(whKolkata.getId(), destCcu.getId());
    }
}
