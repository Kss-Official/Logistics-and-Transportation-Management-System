package com.primeroute.logistics.service;

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
 * Deterministic Fulfillment Engine for warehouse evaluation, routing, and ranking.
 *
 * Routing Architecture:
 * - PICKUP LOCATION -> ORIGIN / FULFILLMENT WAREHOUSE (Inventory fulfilled / reserved here)
 * - DELIVERY LOCATION -> DESTINATION WAREHOUSE (Consignment destination depot / incoming terminal)
 *
 * Evaluation Workflow:
 * 1. Filter ACTIVE warehouses only.
 * 2. Check Line Item Inventory Availability (all items must be available at origin warehouse).
 * 3. Check Physical Capacity (with deterministic unit conversions: KG vs TONS).
 * 4. Check DeliveryType / SLA Feasibility.
 * 5. Compute Geolocation Distance via Haversine against PICKUP address (with fallback to delivery if pickup is missing).
 * 6. Compute Multi-Factor Transparent Allocation Score prioritizing Pickup Location proximity.
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
     * Evaluates candidate origin warehouses for the given order and returns a structured allocation decision.
     * Pure evaluation: does NOT mutate inventory or create shipments.
     * The Origin/Fulfillment Warehouse is determined from order.pickupAddress.
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

        Address pickupAddress = order.getPickupAddress();
        Address deliveryAddress = order.getDeliveryAddress();
        // Origin warehouse evaluation primary anchor is the pickup location (fallback to deliveryAddress if pickup is absent)
        Address originAnchor = pickupAddress != null ? pickupAddress : deliveryAddress;

        List<OrderItem> items = order.getItems() != null ? order.getItems() : Collections.emptyList();
        double orderWeightKg = order.getPackageWeight() != null && order.getPackageWeight() > 0 ? order.getPackageWeight() : 1.0;
        DeliveryType deliveryType = order.getDeliveryType() != null ? order.getDeliveryType() : DeliveryType.STANDARD;

        for (Warehouse warehouse : activeWarehouses) {
            // Check 1: Inventory for all order items at origin warehouse
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
            SlaCheckResult slaResult = checkSla(warehouse, originAnchor, deliveryAddress, deliveryType);
            if (!slaResult.isFeasible()) {
                anySlaFailure = true;
                log.debug("Warehouse {} excluded for order {}: SLA constraint not met ({})",
                        warehouse.getWarehouseCode(), orderNumber, slaResult.getFailureReason());
                continue;
            }

            // Check 4: Distance calculation from origin warehouse to pickup location
            Double distanceKm = calculateDistance(warehouse, originAnchor);

            // Check 5: Deterministic Score Computation prioritizing Pickup / Origin proximity
            double score = computeScore(warehouse, originAnchor, pickupAddress, deliveryAddress, distanceKm, invResult, capResult);

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
        log.info("Fulfillment evaluation for order {}: Selected origin warehouse {} with score {} ({} eligible)",
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

    /**
     * Resolves the corresponding warehouse for a given address (pickup or delivery).
     * Used for independently resolving destinationWarehouse from order.deliveryAddress,
     * or resolving originWarehouse from order.pickupAddress.
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

    private double scoreWarehouseForAddress(Warehouse wh, Address address) {
        double score = 10.0;
        String whCity = wh.getCity() != null ? wh.getCity().trim().toLowerCase() : "";
        String whState = wh.getState() != null ? wh.getState().trim().toLowerCase() : "";
        String whCode = wh.getWarehouseCode() != null ? wh.getWarehouseCode().trim().toLowerCase() : "";

        String addrCity = address.getCity() != null ? address.getCity().trim().toLowerCase() : "";
        String addrState = address.getState() != null ? address.getState().trim().toLowerCase() : "";
        String addrLine1 = address.getAddressLine1() != null ? address.getAddressLine1().trim().toLowerCase() : "";
        String addrLine2 = address.getAddressLine2() != null ? address.getAddressLine2().trim().toLowerCase() : "";

        String combinedAddr = addrCity + " " + addrState + " " + addrLine1 + " " + addrLine2;

        // 1. Kolkata / West Bengal Region Matching
        if (whCity.contains("kolkata") || whCity.contains("calcutta") || whState.contains("west bengal") || whCode.contains("ccu")) {
            if (combinedAddr.contains("kolkata") || combinedAddr.contains("calcutta") || combinedAddr.contains("west bengal") || combinedAddr.contains("westbengal")) {
                score += 100.0;
            }
        }

        // 2. Bengaluru / Bangalore / Karnataka Region Matching
        if (whCity.contains("bengaluru") || whCity.contains("bangalore") || whState.contains("karnataka") || whCode.contains("blr")) {
            if (combinedAddr.contains("bengaluru") || combinedAddr.contains("bangalore") || combinedAddr.contains("banglore") || combinedAddr.contains("karnataka")) {
                score += 100.0;
            }
        }

        // 3. Generic City / State Matching
        if (!whCity.isEmpty() && (!addrCity.isEmpty() && (addrCity.contains(whCity) || whCity.contains(addrCity)))) {
            score += 80.0;
        }
        if (!whState.isEmpty() && (!addrState.isEmpty() && addrState.equalsIgnoreCase(whState))) {
            score += 40.0;
        }

        // 4. Coordinates / Haversine proximity bonus (if present)
        Double dist = calculateDistance(wh, address);
        if (dist != null) {
            score += Math.max(0.0, 50.0 - (dist * 0.02));
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
    // 3. DELIVERY TYPE / SLA EVALUATION
    // =========================================================

    private SlaCheckResult checkSla(Warehouse warehouse, Address originAnchor, Address deliveryAddress, DeliveryType deliveryType) {
        if (deliveryType == DeliveryType.SAME_DAY) {
            // Same-day SLA requires local city alignment or proximity between origin warehouse and delivery location
            if (deliveryAddress == null) {
                return new SlaCheckResult(false, "Delivery address required for SAME_DAY SLA");
            }

            String deliveryCity = deliveryAddress.getCity() != null ? deliveryAddress.getCity().trim().toLowerCase() : "";
            String warehouseCity = warehouse.getCity() != null ? warehouse.getCity().trim().toLowerCase() : "";

            if (!deliveryCity.isEmpty() && !warehouseCity.isEmpty() && (deliveryCity.contains(warehouseCity) || warehouseCity.contains(deliveryCity))) {
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
            Address originAnchor,
            Address pickupAddress,
            Address deliveryAddress,
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
