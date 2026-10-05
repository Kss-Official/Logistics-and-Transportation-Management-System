const fs = require('fs');
const path = require('path');
const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

const content = `package com.primeroute.logistics.service;

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
 * Deterministic Fulfillment Engine for PrimeRoute Logistics.
 *
 * Authoritative Business Rule:
 * 1. The origin / fulfillment warehouse is determined EXCLUSIVELY from the customer's PICKUP / ORIGIN ADDRESS.
 * 2. Delivery destination MUST NEVER influence origin warehouse allocation.
 * 3. The allocated origin warehouse is responsible for order staging, picking, packing, fleet assignment, and outbound dispatch.
 */
@Service
public class FulfillmentEngineService {

    private static final Logger log = LoggerFactory.getLogger(FulfillmentEngineService.class);

    private static final double EARTH_RADIUS_KM = 6371.0;
    private static final double MAX_ORIGIN_SERVICE_RADIUS_KM = 250.0;

    private final WarehouseRepository warehouseRepository;
    private final InventoryRepository inventoryRepository;

    public FulfillmentEngineService(
            WarehouseRepository warehouseRepository,
            InventoryRepository inventoryRepository) {
        this.warehouseRepository = warehouseRepository;
        this.inventoryRepository = inventoryRepository;
    }

    /**
     * Evaluates candidate origin warehouses for the given order and returns a structured allocation decision.
     * Pure evaluation: does NOT mutate inventory or create shipments.
     * The Origin/Fulfillment Warehouse is determined EXCLUSIVELY from order.pickupAddress.
     */
    @Transactional(readOnly = true)
    public FulfillmentEvaluationResultDTO evaluateOrder(Order order) {
        if (order == null) {
            return FulfillmentEvaluationResultDTO.exception(null, null, "ORDER_CANNOT_BE_NULL");
        }

        Long orderId = order.getId();
        String orderNumber = order.getOrderNumber();

        Address pickupAddress = order.getPickupAddress();
        Address deliveryAddress = order.getDeliveryAddress();
        // Authoritative origin anchor is pickupAddress (fallback to deliveryAddress only if pickup is null)
        Address originAnchor = pickupAddress != null ? pickupAddress : deliveryAddress;

        if (originAnchor == null) {
            log.warn("[FULFILLMENT] Order {} Pickup=NONE/NONE OriginWarehouse=NONE Allocation=EXCEPTION Reason=NO_ORIGIN_ADDRESS", orderNumber);
            return FulfillmentEvaluationResultDTO.exception(orderId, orderNumber, "NO_ORIGIN_ADDRESS");
        }

        String pickupCity = originAnchor.getCity() != null ? originAnchor.getCity() : "UNKNOWN";
        String pickupPostal = originAnchor.getPostalCode() != null ? originAnchor.getPostalCode() : "UNKNOWN";

        // 1. Fetch active warehouses
        List<Warehouse> activeWarehouses = warehouseRepository.findByStatus(WarehouseStatus.ACTIVE);
        if (activeWarehouses == null || activeWarehouses.isEmpty()) {
            log.warn("[FULFILLMENT] Order {} Pickup={}/{} OriginWarehouse=NONE Allocation=EXCEPTION Reason=NO_ACTIVE_WAREHOUSES",
                    orderNumber, pickupCity, pickupPostal);
            return FulfillmentEvaluationResultDTO.exception(orderId, orderNumber, "NO_ACTIVE_WAREHOUSES");
        }

        List<CandidateEvaluation> candidates = new ArrayList<>();
        boolean anyInventoryFailure = false;
        boolean anyCapacityFailure = false;
        boolean anyOriginCoverageFailure = false;

        List<OrderItem> items = order.getItems() != null ? order.getItems() : Collections.emptyList();
        double orderWeightKg = order.getPackageWeight() != null && order.getPackageWeight() > 0 ? order.getPackageWeight() : 1.0;

        for (Warehouse warehouse : activeWarehouses) {
            // Check 0: Hard Origin Service / Proximity Match Check against originAnchor (pickup location)
            if (!isWarehouseEligibleForOrigin(warehouse, originAnchor)) {
                anyOriginCoverageFailure = true;
                log.debug("Warehouse {} excluded for order {}: not in origin service area for pickup location ({}, {})",
                        warehouse.getWarehouseCode(), orderNumber, originAnchor.getCity(), originAnchor.getState());
                continue;
            }

            // Check 1: Inventory for all order items at origin warehouse
            InventoryCheckResult invResult = checkInventory(warehouse, items);
            if (!invResult.isAvailable()) {
                anyInventoryFailure = true;
                log.debug("Warehouse {} excluded for order {}: insufficient inventory ({})",
                        warehouse.getWarehouseCode(), orderNumber, invResult.getFailureReason());
                continue;
            }

            // Check 2: Physical Capacity check
            CapacityCheckResult capResult = checkCapacity(warehouse, orderWeightKg);
            if (!capResult.isFeasible()) {
                anyCapacityFailure = true;
                log.debug("Warehouse {} excluded for order {}: capacity exceeded ({})",
                        warehouse.getWarehouseCode(), orderNumber, capResult.getFailureReason());
                continue;
            }

            // Check 3: Distance calculation from origin warehouse to pickup location
            Double distanceKm = calculateDistance(warehouse, originAnchor);

            // Check 4: Deterministic Score Computation strictly prioritizing Pickup / Origin proximity
            double score = computeScore(warehouse, originAnchor, distanceKm, invResult, capResult);

            candidates.add(new CandidateEvaluation(warehouse, score, distanceKm));
        }

        // Handle zero eligible candidates
        if (candidates.isEmpty()) {
            String failureReason = "NO_ELIGIBLE_WAREHOUSE";
            if (anyOriginCoverageFailure && !anyInventoryFailure && !anyCapacityFailure) {
                failureReason = "NO_ELIGIBLE_WAREHOUSE_FOR_ORIGIN";
            } else if (anyInventoryFailure && !anyCapacityFailure) {
                failureReason = "INSUFFICIENT_INVENTORY";
            } else if (anyCapacityFailure && !anyInventoryFailure) {
                failureReason = "CAPACITY_UNAVAILABLE";
            }

            log.warn("[FULFILLMENT] Order {} Pickup={}/{} OriginWarehouse=NONE Allocation=EXCEPTION Reason={}",
                    orderNumber, pickupCity, pickupPostal, failureReason);
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
        log.info("[FULFILLMENT] Order {} Pickup={}/{} OriginWarehouse={} Allocation=ALLOCATED",
                orderNumber, pickupCity, pickupPostal, best.getWarehouse().getWarehouseCode());

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

    /**
     * Determines whether a warehouse is regionally eligible to fulfill orders originating from a pickup address.
     */
    public boolean isWarehouseEligibleForOrigin(Warehouse warehouse, Address pickupAddress) {
        if (warehouse == null || pickupAddress == null) {
            return false;
        }

        // Check 1: Location/Region Match Score (textual city/state/pin/region match)
        double locationScore = scoreWarehouseForAddress(warehouse, pickupAddress);
        if (locationScore >= 40.0) {
            return true;
        }

        // Check 2: Physical Geodesic Proximity within operational direct service radius (<= 250km)
        Double dist = calculateDistance(warehouse, pickupAddress);
        if (dist != null && dist <= MAX_ORIGIN_SERVICE_RADIUS_KM) {
            return true;
        }

        return false;
    }

    /**
     * Resolves the corresponding warehouse for a given address (pickup or delivery).
     */
    @Transactional(readOnly = true)
    public Warehouse resolveWarehouseForAddress(Address address) {
        if (address == null) {
            return null;
        }
        List<Warehouse> activeWarehouses = warehouseRepository.findByStatus(WarehouseStatus.ACTIVE);
        if (activeWarehouses == null || activeWarehouses.isEmpty()) {
            return null;
        }
        return resolveWarehouseForAddress(address, activeWarehouses);
    }

    /**
     * Deterministically resolves the best-fit warehouse for an address among a list of candidates.
     */
    public Warehouse resolveWarehouseForAddress(Address address, List<Warehouse> warehouses) {
        if (address == null || warehouses == null || warehouses.isEmpty()) {
            return null;
        }

        Warehouse bestMatch = null;
        double bestScore = -1.0;

        for (Warehouse wh : warehouses) {
            double score = scoreWarehouseForAddress(wh, address);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = wh;
            }
        }

        return bestMatch != null ? bestMatch : warehouses.get(0);
    }

    public double scoreWarehouseForAddress(Warehouse wh, Address address) {
        if (wh == null || address == null) {
            return 0.0;
        }

        double score = 0.0;
        String whCity = wh.getCity() != null ? wh.getCity().trim().toLowerCase() : "";
        String whState = wh.getState() != null ? wh.getState().trim().toLowerCase() : "";
        String whCode = wh.getWarehouseCode() != null ? wh.getWarehouseCode().trim().toLowerCase() : "";

        String addrCity = address.getCity() != null ? address.getCity().trim().toLowerCase() : "";
        String addrState = address.getState() != null ? address.getState().trim().toLowerCase() : "";
        String addrLine1 = address.getAddressLine1() != null ? address.getAddressLine1().trim().toLowerCase() : "";
        String addrLine2 = address.getAddressLine2() != null ? address.getAddressLine2().trim().toLowerCase() : "";
        String postalCode = address.getPostalCode() != null ? address.getPostalCode().trim().toLowerCase() : "";

        String combinedAddr = addrCity + " " + addrState + " " + addrLine1 + " " + addrLine2 + " " + postalCode;

        // 1. Kolkata / West Bengal Region Matching (WH-CCU-006)
        if (whCity.contains("kolkata") || whCity.contains("calcutta") || whState.contains("west bengal") || whCode.contains("ccu")) {
            if (combinedAddr.contains("kolkata") || combinedAddr.contains("calcutta") || combinedAddr.contains("west bengal") || combinedAddr.contains("westbengal") || postalCode.startsWith("700") || postalCode.startsWith("711") || postalCode.startsWith("712") || postalCode.startsWith("713") || postalCode.startsWith("71")) {
                score += 100.0;
            }
        }

        // 2. Bengaluru / Bangalore / Karnataka Region Matching (WH-BLR-001)
        if (whCity.contains("bengaluru") || whCity.contains("bangalore") || whCity.contains("banglore") || whState.contains("karnataka") || whCode.contains("blr")) {
            if (combinedAddr.contains("bengaluru") || combinedAddr.contains("bangalore") || combinedAddr.contains("banglore") || combinedAddr.contains("bangalore urban") || combinedAddr.contains("bangalore rural") || combinedAddr.contains("karnataka") || postalCode.startsWith("560") || postalCode.startsWith("561") || postalCode.startsWith("562")) {
                score += 100.0;
            }
        }

        // 3. Mumbai / Maharashtra Region Matching
        if (whCity.contains("mumbai") || whCity.contains("bombay") || whState.contains("maharashtra") || whCode.contains("bom")) {
            if (combinedAddr.contains("mumbai") || combinedAddr.contains("bombay") || combinedAddr.contains("maharashtra") || postalCode.startsWith("400") || postalCode.startsWith("401")) {
                score += 100.0;
            }
        }

        // 4. Delhi / NCR Region Matching
        if (whCity.contains("delhi") || whState.contains("delhi") || whCode.contains("del")) {
            if (combinedAddr.contains("delhi") || postalCode.startsWith("110")) {
                score += 100.0;
            }
        }

        // 5. Generic City / State Matching
        if (!whCity.isEmpty() && combinedAddr.contains(whCity)) {
            score += 80.0;
        }
        if (!whState.isEmpty() && combinedAddr.contains(whState)) {
            score += 40.0;
        }

        return score;
    }

    // =========================================================
    // 1. INVENTORY AVAILABILITY CHECK
    // =========================================================

    private InventoryCheckResult checkInventory(Warehouse warehouse, List<OrderItem> items) {
        if (items.isEmpty()) {
            return new InventoryCheckResult(true, 10, null);
        }

        int totalSurplus = 0;
        for (OrderItem item : items) {
            if (item.getProduct() == null) continue;

            Product product = item.getProduct();
            int requiredQty = item.getQuantity() != null && item.getQuantity() > 0 ? item.getQuantity() : 1;

            Optional<Inventory> invOpt = inventoryRepository.findByWarehouseAndProduct(warehouse, product);
            if (invOpt.isEmpty()) {
                invOpt = inventoryRepository.findByWarehouseAndSku(warehouse, product.getSku());
            }

            if (invOpt.isEmpty()) {
                return new InventoryCheckResult(false, 0,
                        "Product " + product.getSku() + " not stocked at " + warehouse.getWarehouseCode());
            }

            Inventory inv = invOpt.get();
            int available = inv.getAvailableStock() != null ? inv.getAvailableStock() : 0;
            if (available < requiredQty) {
                return new InventoryCheckResult(false, 0,
                        String.format("Insufficient stock for %s at %s: requested %d, available %d",
                                product.getSku(), warehouse.getWarehouseCode(), requiredQty, available));
            }

            totalSurplus += (available - requiredQty);
        }

        return new InventoryCheckResult(true, totalSurplus, null);
    }

    // =========================================================
    // 2. PHYSICAL CAPACITY CHECK
    // =========================================================

    private CapacityCheckResult checkCapacity(Warehouse warehouse, double orderWeightKg) {
        Double totalCap = warehouse.getTotalCapacity();
        Double occupiedCap = warehouse.getOccupiedCapacity() != null ? warehouse.getOccupiedCapacity() : 0.0;
        String unit = warehouse.getCapacityUnit() != null ? warehouse.getCapacityUnit().trim().toUpperCase() : "TONS";

        if (totalCap == null || totalCap <= 0.0) {
            return new CapacityCheckResult(true, 1.0, null);
        }

        double orderWeightInUnit = orderWeightKg;
        if ("TONS".equals(unit)) {
            orderWeightInUnit = orderWeightKg / 1000.0;
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
    // 3. DISTANCE (HAVERSINE)
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
    // 4. DETERMINISTIC SCORING FORMULA
    // =========================================================

    private double computeScore(
            Warehouse warehouse,
            Address originAnchor,
            Double distanceKm,
            InventoryCheckResult invResult,
            CapacityCheckResult capResult) {

        double score = 100.0; // Base score for fulfilling all hard eligibility requirements

        // 1. Origin / Pickup Proximity Alignment (Authoritative for Fulfillment Origin)
        double matchScore = scoreWarehouseForAddress(warehouse, originAnchor);
        score += matchScore;

        // 2. Geodesic Distance factor to pickup/origin location (if coordinates are present)
        if (distanceKm != null) {
            // Closer warehouse to origin pickup gets up to 50 points bonus
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
}
`;

const targetFile = path.join(BACKEND_DIR, 'src/main/java/com/primeroute/logistics/service/FulfillmentEngineService.java');
fs.writeFileSync(targetFile, content, 'utf8');
console.log('Updated FulfillmentEngineService.java successfully.');
