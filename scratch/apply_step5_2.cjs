const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const SRC_MAIN_JAVA = path.join(BACKEND_ROOT, 'src', 'main', 'java', 'com', 'primeroute', 'logistics');
const SRC_TEST_JAVA = path.join(BACKEND_ROOT, 'src', 'test', 'java', 'com', 'primeroute', 'logistics');

// 1. DTO
const dtoCode = `package com.primeroute.logistics.dto;

import com.primeroute.logistics.entity.FulfillmentAllocationMethod;
import com.primeroute.logistics.entity.FulfillmentAllocationStatus;
import com.primeroute.logistics.entity.Warehouse;

public class FulfillmentEvaluationResultDTO {

    private Long orderId;
    private String orderNumber;
    private Long selectedWarehouseId;
    private String selectedWarehouseCode;
    private String selectedWarehouseName;
    private FulfillmentAllocationStatus allocationStatus;
    private FulfillmentAllocationMethod allocationMethod;
    private Double allocationScore;
    private Double distanceKm;
    private String reason;
    private Integer eligibleWarehouseCount;

    public FulfillmentEvaluationResultDTO() {}

    public FulfillmentEvaluationResultDTO(
            Long orderId,
            String orderNumber,
            Long selectedWarehouseId,
            String selectedWarehouseCode,
            String selectedWarehouseName,
            FulfillmentAllocationStatus allocationStatus,
            FulfillmentAllocationMethod allocationMethod,
            Double allocationScore,
            Double distanceKm,
            String reason,
            Integer eligibleWarehouseCount) {
        this.orderId = orderId;
        this.orderNumber = orderNumber;
        this.selectedWarehouseId = selectedWarehouseId;
        this.selectedWarehouseCode = selectedWarehouseCode;
        this.selectedWarehouseName = selectedWarehouseName;
        this.allocationStatus = allocationStatus;
        this.allocationMethod = allocationMethod;
        this.allocationScore = allocationScore;
        this.distanceKm = distanceKm;
        this.reason = reason;
        this.eligibleWarehouseCount = eligibleWarehouseCount;
    }

    public static FulfillmentEvaluationResultDTO exception(Long orderId, String orderNumber, String reason) {
        return new FulfillmentEvaluationResultDTO(
                orderId,
                orderNumber,
                null,
                null,
                null,
                FulfillmentAllocationStatus.EXCEPTION,
                FulfillmentAllocationMethod.AUTOMATIC,
                null,
                null,
                reason,
                0
        );
    }

    public static FulfillmentEvaluationResultDTO allocated(
            Long orderId,
            String orderNumber,
            Warehouse warehouse,
            Double score,
            Double distanceKm,
            String reason,
            int eligibleCount) {
        return new FulfillmentEvaluationResultDTO(
                orderId,
                orderNumber,
                warehouse != null ? warehouse.getId() : null,
                warehouse != null ? warehouse.getWarehouseCode() : null,
                warehouse != null ? warehouse.getWarehouseName() : null,
                FulfillmentAllocationStatus.ALLOCATED,
                FulfillmentAllocationMethod.AUTOMATIC,
                score,
                distanceKm,
                reason,
                eligibleCount
        );
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public Long getSelectedWarehouseId() {
        return selectedWarehouseId;
    }

    public void setSelectedWarehouseId(Long selectedWarehouseId) {
        this.selectedWarehouseId = selectedWarehouseId;
    }

    public String getSelectedWarehouseCode() {
        return selectedWarehouseCode;
    }

    public void setSelectedWarehouseCode(String selectedWarehouseCode) {
        this.selectedWarehouseCode = selectedWarehouseCode;
    }

    public String getSelectedWarehouseName() {
        return selectedWarehouseName;
    }

    public void setSelectedWarehouseName(String selectedWarehouseName) {
        this.selectedWarehouseName = selectedWarehouseName;
    }

    public FulfillmentAllocationStatus getAllocationStatus() {
        return allocationStatus;
    }

    public void setAllocationStatus(FulfillmentAllocationStatus allocationStatus) {
        this.allocationStatus = allocationStatus;
    }

    public FulfillmentAllocationMethod getAllocationMethod() {
        return allocationMethod;
    }

    public void setAllocationMethod(FulfillmentAllocationMethod allocationMethod) {
        this.allocationMethod = allocationMethod;
    }

    public Double getAllocationScore() {
        return allocationScore;
    }

    public void setAllocationScore(Double allocationScore) {
        this.allocationScore = allocationScore;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Integer getEligibleWarehouseCount() {
        return eligibleWarehouseCount;
    }

    public void setEligibleWarehouseCount(Integer eligibleWarehouseCount) {
        this.eligibleWarehouseCount = eligibleWarehouseCount;
    }

    @Override
    public String toString() {
        return "FulfillmentEvaluationResultDTO{" +
                "orderId=" + orderId +
                ", orderNumber='" + orderNumber + '\\'' +
                ", selectedWarehouseId=" + selectedWarehouseId +
                ", selectedWarehouseCode='" + selectedWarehouseCode + '\\'' +
                ", selectedWarehouseName='" + selectedWarehouseName + '\\'' +
                ", allocationStatus=" + allocationStatus +
                ", allocationMethod=" + allocationMethod +
                ", allocationScore=" + allocationScore +
                ", distanceKm=" + distanceKm +
                ", reason='" + reason + '\\'' +
                ", eligibleWarehouseCount=" + eligibleWarehouseCount +
                '}';
    }
}
`;

// 2. Service
const serviceCode = `package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.FulfillmentEvaluationResultDTO;
import com.primeroute.logistics.entity.*;
import com.primeroute.logistics.repository.InventoryRepository;
import com.primeroute.logistics.repository.WarehouseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Deterministic Fulfillment Engine for warehouse evaluation and ranking.
 *
 * Evaluation Workflow:
 * 1. Filter ACTIVE warehouses only.
 * 2. Check Line Item Inventory Availability (all items must be available).
 * 3. Check Physical Capacity (with deterministic unit conversions: KG vs TONS).
 * 4. Check DeliveryType / SLA Feasibility (e.g. SAME_DAY requires local city / proximity).
 * 5. Compute Geolocation Distance via Haversine (if lat/lon available on both address & warehouse).
 * 6. Compute Multi-Factor Transparent Allocation Score.
 * 7. Rank candidates with deterministic tie-breaking.
 */
@Service
public class FulfillmentEngineService {

    private static final Logger log = LoggerFactory.getLogger(FulfillmentEngineService.class);
    private static final double EARTH_RADIUS_KM = 6371.0;

    private final WarehouseRepository warehouseRepository;
    private final InventoryRepository inventoryRepository;

    public FulfillmentEngineService(
            WarehouseRepository warehouseRepository,
            InventoryRepository inventoryRepository) {
        this.warehouseRepository = warehouseRepository;
        this.inventoryRepository = inventoryRepository;
    }

    /**
     * Evaluates candidate warehouses for the given order and returns a structured allocation decision.
     * Pure evaluation: does NOT mutate inventory or create shipments.
     */
    @Transactional(readOnly = true)
    public FulfillmentEvaluationResultDTO evaluateOrder(Order order) {
        if (order == null) {
            return FulfillmentEvaluationResultDTO.exception(null, null, "ORDER_CANNOT_BE_NULL");
        }

        Long orderId = order.getId();
        String orderNumber = order.getOrderNumber();

        // 1. Fetch active warehouses
        List<Warehouse> activeWarehouses = warehouseRepository.findByStatus(WarehouseStatus.ACTIVE);
        if (activeWarehouses == null || activeWarehouses.isEmpty()) {
            log.warn("Fulfillment evaluation for order {}: No active warehouses found", orderNumber);
            return FulfillmentEvaluationResultDTO.exception(orderId, orderNumber, "NO_ACTIVE_WAREHOUSES");
        }

        List<CandidateEvaluation> candidates = new ArrayList<>();
        boolean anyInventoryFailure = false;
        boolean anyCapacityFailure = false;
        boolean anySlaFailure = false;

        Address deliveryAddress = order.getDeliveryAddress();
        Address pickupAddress = order.getPickupAddress();
        List<OrderItem> items = order.getItems() != null ? order.getItems() : Collections.emptyList();
        double orderWeightKg = order.getPackageWeight() != null && order.getPackageWeight() > 0 ? order.getPackageWeight() : 1.0;
        DeliveryType deliveryType = order.getDeliveryType() != null ? order.getDeliveryType() : DeliveryType.STANDARD;

        for (Warehouse warehouse : activeWarehouses) {
            // Check 1: Inventory for all order items
            InventoryCheckResult invResult = checkInventory(warehouse, items);
            if (!invResult.isAvailable()) {
                anyInventoryFailure = true;
                log.debug("Warehouse {} excluded for order {}: insufficient inventory ({})",
                        warehouse.getWarehouseCode(), orderNumber, invResult.getFailureReason());
                continue;
            }

            // Check 2: Capacity check
            CapacityCheckResult capResult = checkCapacity(warehouse, orderWeightKg);
            if (!capResult.isFeasible()) {
                anyCapacityFailure = true;
                log.debug("Warehouse {} excluded for order {}: capacity exceeded ({})",
                        warehouse.getWarehouseCode(), orderNumber, capResult.getFailureReason());
                continue;
            }

            // Check 3: Delivery SLA check (e.g. SAME_DAY requires local city / proximity)
            SlaCheckResult slaResult = checkSla(warehouse, deliveryAddress, deliveryType);
            if (!slaResult.isFeasible()) {
                anySlaFailure = true;
                log.debug("Warehouse {} excluded for order {}: SLA constraint not met ({})",
                        warehouse.getWarehouseCode(), orderNumber, slaResult.getFailureReason());
                continue;
            }

            // Check 4: Distance calculation
            Double distanceKm = calculateDistance(warehouse, deliveryAddress);

            // Check 5: Deterministic Score Computation
            double score = computeScore(warehouse, deliveryAddress, pickupAddress, distanceKm, invResult, capResult);

            candidates.add(new CandidateEvaluation(warehouse, score, distanceKm));
        }

        // Handle zero eligible candidates
        if (candidates.isEmpty()) {
            String failureReason = "NO_ELIGIBLE_WAREHOUSE";
            if (anyInventoryFailure && !anyCapacityFailure && !anySlaFailure) {
                failureReason = "INSUFFICIENT_INVENTORY";
            } else if (anyCapacityFailure && !anyInventoryFailure && !anySlaFailure) {
                failureReason = "CAPACITY_UNAVAILABLE";
            } else if (anySlaFailure && !anyInventoryFailure && !anyCapacityFailure) {
                failureReason = "SLA_UNAVAILABLE";
            }

            log.info("Fulfillment evaluation for order {}: No eligible warehouse found. Reason: {}", orderNumber, failureReason);
            return FulfillmentEvaluationResultDTO.exception(orderId, orderNumber, failureReason);
        }

        // Rank candidates: Score DESC, then Warehouse ID ASC (deterministic tie-breaker)
        candidates.sort((c1, c2) -> {
            int scoreCompare = Double.compare(c2.getScore(), c1.getScore());
            if (scoreCompare != 0) {
                return scoreCompare;
            }
            Long id1 = c1.getWarehouse().getId() != null ? c1.getWarehouse().getId() : 0L;
            Long id2 = c2.getWarehouse().getId() != null ? c2.getWarehouse().getId() : 0L;
            return id1.compareTo(id2);
        });

        CandidateEvaluation best = candidates.get(0);
        log.info("Fulfillment evaluation for order {}: Selected warehouse {} with score {} ({} eligible)",
                orderNumber, best.getWarehouse().getWarehouseCode(), best.getScore(), candidates.size());

        return FulfillmentEvaluationResultDTO.allocated(
                orderId,
                orderNumber,
                best.getWarehouse(),
                best.getScore(),
                best.getDistanceKm(),
                "OPTIMAL_WAREHOUSE_ALLOCATED",
                candidates.size()
        );
    }

    // =========================================================
    // 1. INVENTORY EVALUATION
    // =========================================================

    private InventoryCheckResult checkInventory(Warehouse warehouse, List<OrderItem> items) {
        if (items == null || items.isEmpty()) {
            // Direct package order without discrete catalog items passes inventory check
            return new InventoryCheckResult(true, 0, null);
        }

        int totalSurplus = 0;

        for (OrderItem item : items) {
            if (item.getProduct() == null) {
                continue;
            }

            Optional<Inventory> invOpt = inventoryRepository.findByWarehouseAndProduct(warehouse, item.getProduct());
            if (invOpt.isEmpty()) {
                // Fallback by SKU if product entity reference differs
                invOpt = inventoryRepository.findByWarehouseAndSku(warehouse, item.getProduct().getSku());
            }

            if (invOpt.isEmpty()) {
                return new InventoryCheckResult(false, 0, "Missing SKU: " + item.getProduct().getSku());
            }

            Inventory inventory = invOpt.get();
            int requiredQty = item.getQuantity() != null && item.getQuantity() > 0 ? item.getQuantity() : 1;
            int availableStock = inventory.getAvailableStock() != null ? inventory.getAvailableStock() : 0;

            if (availableStock < requiredQty) {
                return new InventoryCheckResult(false, 0,
                        "Insufficient stock for SKU " + item.getProduct().getSku() +
                                ": available " + availableStock + ", required " + requiredQty);
            }

            totalSurplus += (availableStock - requiredQty);
        }

        return new InventoryCheckResult(true, totalSurplus, null);
    }

    // =========================================================
    // 2. CAPACITY EVALUATION (With Unit Conversion)
    // =========================================================

    private CapacityCheckResult checkCapacity(Warehouse warehouse, double orderWeightKg) {
        Double totalCap = warehouse.getTotalCapacity();
        if (totalCap == null || totalCap <= 0) {
            // Unconstrained or unconfigured capacity
            return new CapacityCheckResult(true, 1.0, null);
        }

        Double occupiedCap = warehouse.getOccupiedCapacity() != null ? warehouse.getOccupiedCapacity() : 0.0;
        String unit = warehouse.getCapacityUnit() != null ? warehouse.getCapacityUnit().trim().toUpperCase() : "KG";

        double orderWeightInUnit;
        if (unit.contains("TON") || unit.equals("MT")) {
            // Convert KG to TONS
            orderWeightInUnit = orderWeightKg / 1000.0;
        } else if (unit.contains("KG") || unit.contains("KILOGRAM")) {
            orderWeightInUnit = orderWeightKg;
        } else {
            // Units, CBM, Pallets without discrete weight conversion: assume normalized standard unit
            orderWeightInUnit = orderWeightKg;
        }

        double projectedOccupied = occupiedCap + orderWeightInUnit;
        if (projectedOccupied > totalCap) {
            return new CapacityCheckResult(false, 0.0,
                    String.format("Capacity exceeded: %.2f + %.2f > %.2f %s", occupiedCap, orderWeightInUnit, totalCap, unit));
        }

        double headroomRatio = Math.max(0.0, (totalCap - projectedOccupied) / totalCap);
        return new CapacityCheckResult(true, headroomRatio, null);
    }

    // =========================================================
    // 3. DELIVERY TYPE / SLA EVALUATION
    // =========================================================

    private SlaCheckResult checkSla(Warehouse warehouse, Address deliveryAddress, DeliveryType deliveryType) {
        if (deliveryType == DeliveryType.SAME_DAY) {
            // Same-day SLA requires local city alignment or proximity
            if (deliveryAddress == null) {
                return new SlaCheckResult(false, "Delivery address required for SAME_DAY SLA");
            }

            String deliveryCity = deliveryAddress.getCity() != null ? deliveryAddress.getCity().trim().toLowerCase() : "";
            String warehouseCity = warehouse.getCity() != null ? warehouse.getCity().trim().toLowerCase() : "";

            if (!deliveryCity.isEmpty() && !warehouseCity.isEmpty() && deliveryCity.contains(warehouseCity)) {
                return new SlaCheckResult(true, null);
            }

            // If coordinates exist, allow within 50km radius for same-day
            Double dist = calculateDistance(warehouse, deliveryAddress);
            if (dist != null && dist <= 50.0) {
                return new SlaCheckResult(true, null);
            }

            return new SlaCheckResult(false, "SAME_DAY delivery requires local city or proximity within 50km");
        }

        // Standard and Express delivery are supported across the active network
        return new SlaCheckResult(true, null);
    }

    // =========================================================
    // 4. DISTANCE (HAVERSINE)
    // =========================================================

    public Double calculateDistance(Warehouse warehouse, Address address) {
        if (warehouse == null || address == null) {
            return null;
        }

        Double lat1 = warehouse.getLatitude();
        Double lon1 = warehouse.getLongitude();
        Double lat2 = address.getLatitude();
        Double lon2 = address.getLongitude();

        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return null;
        }

        // 0,0 coordinates check
        if (Math.abs(lat1) < 0.0001 && Math.abs(lon1) < 0.0001) return null;
        if (Math.abs(lat2) < 0.0001 && Math.abs(lon2) < 0.0001) return null;

        return calculateHaversineDistance(lat1, lon1, lat2, lon2);
    }

    public Double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = EARTH_RADIUS_KM * c;

        return Math.round(distance * 100.0) / 100.0;
    }

    // =========================================================
    // 5. DETERMINISTIC SCORING FORMULA
    // =========================================================

    private double computeScore(
            Warehouse warehouse,
            Address deliveryAddress,
            Address pickupAddress,
            Double distanceKm,
            InventoryCheckResult invResult,
            CapacityCheckResult capResult) {

        double score = 100.0; // Base score for fulfilling all hard eligibility requirements

        String whCity = warehouse.getCity() != null ? warehouse.getCity().trim().toLowerCase() : "";
        String whState = warehouse.getState() != null ? warehouse.getState().trim().toLowerCase() : "";

        // 1. City / State proximity alignment
        if (deliveryAddress != null) {
            String delCity = deliveryAddress.getCity() != null ? deliveryAddress.getCity().trim().toLowerCase() : "";
            String delState = deliveryAddress.getState() != null ? deliveryAddress.getState().trim().toLowerCase() : "";

            if (!whCity.isEmpty() && !delCity.isEmpty() && (delCity.contains(whCity) || whCity.contains(delCity))) {
                score += 30.0;
            } else if (!whState.isEmpty() && !delState.isEmpty() && whState.equalsIgnoreCase(delState)) {
                score += 15.0;
            }
        }

        if (pickupAddress != null) {
            String pickCity = pickupAddress.getCity() != null ? pickupAddress.getCity().trim().toLowerCase() : "";
            if (!whCity.isEmpty() && !pickCity.isEmpty() && (pickCity.contains(whCity) || whCity.contains(pickCity))) {
                score += 10.0;
            }
        }

        // 2. Geodesic Distance factor (if coordinates are present)
        if (distanceKm != null) {
            // Closer warehouse gets up to 50 points bonus (decreases by 0.05 per km)
            double distanceBonus = Math.max(0.0, 50.0 - (distanceKm * 0.05));
            score += distanceBonus;
        }

        // 3. Capacity Headroom factor (more available capacity gets higher score, up to 20 pts)
        score += (capResult.getHeadroomRatio() * 20.0);

        // 4. Inventory Depth / Surplus factor (up to 10 pts)
        score += Math.min(10.0, invResult.getTotalSurplus() * 0.1);

        return Math.round(score * 100.0) / 100.0;
    }

    // =========================================================
    // INTERNAL HELPER VALUE OBJECTS
    // =========================================================

    private static class CandidateEvaluation {
        private final Warehouse warehouse;
        private final double score;
        private final Double distanceKm;

        public CandidateEvaluation(Warehouse warehouse, double score, Double distanceKm) {
            this.warehouse = warehouse;
            this.score = score;
            this.distanceKm = distanceKm;
        }

        public Warehouse getWarehouse() { return warehouse; }
        public double getScore() { return score; }
        public Double getDistanceKm() { return distanceKm; }
    }

    private static class InventoryCheckResult {
        private final boolean available;
        private final int totalSurplus;
        private final String failureReason;

        public InventoryCheckResult(boolean available, int totalSurplus, String failureReason) {
            this.available = available;
            this.totalSurplus = totalSurplus;
            this.failureReason = failureReason;
        }

        public boolean isAvailable() { return available; }
        public int getTotalSurplus() { return totalSurplus; }
        public String getFailureReason() { return failureReason; }
    }

    private static class CapacityCheckResult {
        private final boolean feasible;
        private final double headroomRatio;
        private final String failureReason;

        public CapacityCheckResult(boolean feasible, double headroomRatio, String failureReason) {
            this.feasible = feasible;
            this.headroomRatio = headroomRatio;
            this.failureReason = failureReason;
        }

        public boolean isFeasible() { return feasible; }
        public double getHeadroomRatio() { return headroomRatio; }
        public String getFailureReason() { return failureReason; }
    }

    private static class SlaCheckResult {
        private final boolean feasible;
        private final String failureReason;

        public SlaCheckResult(boolean feasible, String failureReason) {
            this.feasible = feasible;
            this.failureReason = failureReason;
        }

        public boolean isFeasible() { return feasible; }
        public String getFailureReason() { return failureReason; }
    }
}
`;

// 3. Unit Tests
const testCode = `package com.primeroute.logistics.service;

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
    private Product productA;
    private Product productB;
    private Address deliveryAddressMumbai;
    private Address deliveryAddressDelhi;

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

        productA = new Product("SKU-ELEC-001", "Smartphone Pro", "Electronics", 0.5, 49999.0, "Units", 10);
        productA.setId(101L);

        productB = new Product("SKU-ELEC-002", "Wireless Headphones", "Electronics", 0.3, 4999.0, "Units", 10);
        productB.setId(102L);

        deliveryAddressMumbai = new Address();
        deliveryAddressMumbai.setId(1L);
        deliveryAddressMumbai.setCity("Mumbai");
        deliveryAddressMumbai.setState("Maharashtra");
        deliveryAddressMumbai.setPostalCode("400001");
        deliveryAddressMumbai.setLatitude(19.0760);
        deliveryAddressMumbai.setLongitude(72.8777);

        deliveryAddressDelhi = new Address();
        deliveryAddressDelhi.setId(2L);
        deliveryAddressDelhi.setCity("Delhi");
        deliveryAddressDelhi.setState("Delhi");
        deliveryAddressDelhi.setPostalCode("110001");
        deliveryAddressDelhi.setLatitude(28.6139);
        deliveryAddressDelhi.setLongitude(77.2090);
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
        order.setId(10L);
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
        order.setId(11L);
        order.setOrderNumber("PR-ORD-00000002");
        order.setDeliveryAddress(deliveryAddressMumbai);

        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(Collections.emptyList());

        FulfillmentEvaluationResultDTO result = fulfillmentEngineService.evaluateOrder(order);

        assertNotNull(result);
        assertEquals(FulfillmentAllocationStatus.EXCEPTION, result.getAllocationStatus());
        assertEquals("NO_ACTIVE_WAREHOUSES", result.getReason());
        assertNull(result.getSelectedWarehouseId());
    }

    // =========================================================
    // TEST 3: Insufficient inventory for one OrderItem -> excluded
    // =========================================================
    @Test
    @DisplayName("TEST 3: Warehouse with insufficient inventory for an item is excluded")
    void testInsufficientInventoryExcluded() {
        Order order = new Order();
        order.setId(12L);
        order.setOrderNumber("PR-ORD-00000003");
        order.setDeliveryAddress(deliveryAddressMumbai);

        OrderItem item = new OrderItem(order, productA, 10, productA.getUnitWeight(), productA.getUnitPrice());
        order.addItem(item);

        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(List.of(whMumbai));
        // Available stock is only 5 (total 10 - reserved 5)
        when(inventoryRepository.findByWarehouseAndProduct(whMumbai, productA))
                .thenReturn(Optional.of(createInventory(whMumbai, productA, 10, 5, 0)));

        FulfillmentEvaluationResultDTO result = fulfillmentEngineService.evaluateOrder(order);

        assertNotNull(result);
        assertEquals(FulfillmentAllocationStatus.EXCEPTION, result.getAllocationStatus());
        assertEquals("INSUFFICIENT_INVENTORY", result.getReason());
    }

    // =========================================================
    // TEST 4: Multiple OrderItems -> ALL items must be available
    // =========================================================
    @Test
    @DisplayName("TEST 4: Multiple items require all items to be in stock at the candidate warehouse")
    void testMultipleOrderItemsAllMustBeAvailable() {
        Order order = new Order();
        order.setId(13L);
        order.setOrderNumber("PR-ORD-00000004");
        order.setDeliveryAddress(deliveryAddressMumbai);

        OrderItem item1 = new OrderItem(order, productA, 5, productA.getUnitWeight(), productA.getUnitPrice());
        OrderItem item2 = new OrderItem(order, productB, 2, productB.getUnitWeight(), productB.getUnitPrice());
        order.addItem(item1);
        order.addItem(item2);

        when(warehouseRepository.findByStatus(WarehouseStatus.ACTIVE)).thenReturn(List.of(whMumbai, whDelhi));

        // Mumbai has item 1 but out of stock for item 2
        when(inventoryRepository.findByWarehouseAndProduct(whMumbai, productA))
                .thenReturn(Optional.of(createInventory(whMumbai, productA, 20, 0, 0)));
        when(inventoryRepository.findByWarehouseAndProduct(whMumbai, productB))
                .thenReturn(Optional.of(createInventory(whMumbai, productB, 0, 0, 0)));

        // Delhi has BOTH items
        when(inventoryRepository.findByWarehouseAndProduct(whDelhi, productA))
                .thenReturn(Optional.of(createInventory(whDelhi, productA, 20, 0, 0)));
        when(inventoryRepository.findByWarehouseAndProduct(whDelhi, productB))
                .thenReturn(Optional.of(createInventory(whDelhi, productB, 10, 0, 0)));

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
        order.setId(14L);
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
        order.setId(15L);
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
        order.setId(16L);
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
        order.setId(17L);
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
        order.setId(18L);
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
}
`;

fs.mkdirSync(path.join(SRC_TEST_JAVA, 'service'), { recursive: true });

fs.writeFileSync(path.join(SRC_MAIN_JAVA, 'dto', 'FulfillmentEvaluationResultDTO.java'), dtoCode, 'utf8');
console.log('Created dto/FulfillmentEvaluationResultDTO.java');

fs.writeFileSync(path.join(SRC_MAIN_JAVA, 'service', 'FulfillmentEngineService.java'), serviceCode, 'utf8');
console.log('Created service/FulfillmentEngineService.java');

fs.writeFileSync(path.join(SRC_TEST_JAVA, 'service', 'FulfillmentEngineServiceTest.java'), testCode, 'utf8');
console.log('Created test/service/FulfillmentEngineServiceTest.java');
