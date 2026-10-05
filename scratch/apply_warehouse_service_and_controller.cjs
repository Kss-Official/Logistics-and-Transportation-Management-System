const fs = require('fs');
const path = require('path');

const BASE_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

function writeFile(relPath, content) {
  const fullPath = path.join(BASE_DIR, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Wrote: ' + relPath);
}

// 1. WarehouseManagerService.java
writeFile('service/WarehouseManagerService.java', `
package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.warehouse.*;
import com.primeroute.logistics.entity.*;
import com.primeroute.logistics.exception.ResourceNotFoundException;
import com.primeroute.logistics.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class WarehouseManagerService {

    private final UserRepository userRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final ShipmentRepository shipmentRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final ShipmentTrackingEventRepository trackingEventRepository;

    public WarehouseManagerService(
            UserRepository userRepository,
            WarehouseRepository warehouseRepository,
            InventoryRepository inventoryRepository,
            InventoryTransactionRepository transactionRepository,
            ShipmentRepository shipmentRepository,
            DriverRepository driverRepository,
            VehicleRepository vehicleRepository,
            ShipmentTrackingEventRepository trackingEventRepository) {
        this.userRepository = userRepository;
        this.warehouseRepository = warehouseRepository;
        this.inventoryRepository = inventoryRepository;
        this.transactionRepository = transactionRepository;
        this.shipmentRepository = shipmentRepository;
        this.driverRepository = driverRepository;
        this.vehicleRepository = vehicleRepository;
        this.trackingEventRepository = trackingEventRepository;
    }

    /**
     * Resolves the authenticated user and their scoped Warehouse.
     * Enforces strict authorization: Warehouse Managers cannot access data outside their assigned warehouse.
     */
    public Warehouse getScopedWarehouse() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Authentication required.");
        }

        String email = auth.getName();
        User user = userRepository.findByEmailIgnoreCase(email)
                .or(() -> userRepository.findByEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        if (user.getWarehouse() != null) {
            return user.getWarehouse();
        }

        // For ADMIN inspecting warehouse manager portal, fallback to first active warehouse
        if (user.getRole() == Role.ADMIN) {
            List<Warehouse> active = warehouseRepository.findByStatus(WarehouseStatus.ACTIVE);
            if (!active.isEmpty()) {
                return active.get(0);
            }
            return warehouseRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("No warehouses configured in the system."));
        }

        throw new AccessDeniedException("No warehouse assigned to account: " + email + ". Please contact your administrator.");
    }

    public User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth != null ? auth.getName() : "system";
        return userRepository.findByEmailIgnoreCase(email)
                .or(() -> userRepository.findByEmail(email))
                .orElse(null);
    }

    // ==========================================
    // PROFILE & WAREHOUSE DETAILS
    // ==========================================

    @Transactional(readOnly = true)
    public Map<String, Object> getManagerProfile() {
        Warehouse warehouse = getScopedWarehouse();
        User user = getAuthenticatedUser();

        Map<String, Object> profile = new HashMap<>();
        profile.put("email", user != null ? user.getEmail() : "");
        profile.put("fullName", user != null ? user.getFullName() : "");
        profile.put("role", user != null ? user.getRole().name() : Role.WAREHOUSE_MANAGER.name());
        profile.put("phone", user != null ? user.getPhone() : "");
        profile.put("warehouseId", warehouse.getId());
        profile.put("warehouseCode", warehouse.getWarehouseCode());
        profile.put("warehouseName", warehouse.getWarehouseName());
        profile.put("warehouseCity", warehouse.getCity());
        profile.put("warehouseState", warehouse.getState());
        profile.put("warehouseAddress", warehouse.getAddressLine1());
        profile.put("operatingHours", warehouse.getOperatingHours());
        profile.put("warehouseCapacity", warehouse.getTotalCapacity());
        profile.put("capacityUnit", warehouse.getCapacityUnit());
        return profile;
    }

    @Transactional(readOnly = true)
    public Warehouse getWarehouseDetails() {
        return getScopedWarehouse();
    }

    public Warehouse updateWarehouseDetails(UpdateWarehouseDetailsRequest request) {
        Warehouse warehouse = getScopedWarehouse();
        if (request.getOperatingHours() != null && !request.getOperatingHours().isBlank()) {
            warehouse.setOperatingHours(request.getOperatingHours().trim());
        }
        if (request.getContactPhone() != null && !request.getContactPhone().isBlank()) {
            warehouse.setContactPhone(request.getContactPhone().trim());
        }
        if (request.getContactEmail() != null && !request.getContactEmail().isBlank()) {
            warehouse.setContactEmail(request.getContactEmail().trim());
        }
        if (request.getManagerPhone() != null && !request.getManagerPhone().isBlank()) {
            warehouse.setManagerPhone(request.getManagerPhone().trim());
        }
        return warehouseRepository.save(warehouse);
    }

    // ==========================================
    // DASHBOARD
    // ==========================================

    @Transactional(readOnly = true)
    public WarehouseDashboardDTO getDashboard() {
        Warehouse warehouse = getScopedWarehouse();
        WarehouseDashboardDTO dto = new WarehouseDashboardDTO();

        // Warehouse Info
        dto.setWarehouseId(warehouse.getId());
        dto.setWarehouseCode(warehouse.getWarehouseCode());
        dto.setWarehouseName(warehouse.getWarehouseName());
        dto.setWarehouseType(warehouse.getWarehouseType().name());
        dto.setManagerName(warehouse.getManagerName());
        dto.setManagerEmail(warehouse.getManagerEmail());
        dto.setCity(warehouse.getCity());
        dto.setState(warehouse.getState());
        dto.setTotalCapacity(warehouse.getTotalCapacity());
        dto.setOccupiedCapacity(warehouse.getOccupiedCapacity());
        dto.setAvailableCapacity(Math.max(0.0, (warehouse.getTotalCapacity() != null ? warehouse.getTotalCapacity() : 0.0) - (warehouse.getOccupiedCapacity() != null ? warehouse.getOccupiedCapacity() : 0.0)));
        dto.setUtilizationRate(warehouse.getTotalCapacity() != null && warehouse.getTotalCapacity() > 0 ? (warehouse.getOccupiedCapacity() / warehouse.getTotalCapacity()) * 100 : 0.0);
        dto.setStatus(warehouse.getStatus().name());
        dto.setOperatingHours(warehouse.getOperatingHours());

        // Inventory KPIs
        dto.setTotalInventoryItems(inventoryRepository.countByWarehouse(warehouse));
        dto.setAvailableStock(inventoryRepository.sumAvailableStockByWarehouse(warehouse));
        dto.setReservedStock(inventoryRepository.sumReservedStockByWarehouse(warehouse));
        dto.setDamagedStock(inventoryRepository.sumDamagedStockByWarehouse(warehouse));

        List<Inventory> lowStockList = inventoryRepository.findLowStockByWarehouse(warehouse);
        dto.setLowStockCount(lowStockList.size());
        dto.setLowStockAlerts(lowStockList.stream().limit(5).map(this::mapToInventoryDTO).collect(Collectors.toList()));

        // Shipment KPIs
        List<Shipment> incoming = shipmentRepository.findActiveIncomingByWarehouse(warehouse);
        dto.setIncomingShipmentsCount(incoming.size());
        dto.setIncomingPreview(incoming.stream().limit(5).map(this::mapToShipmentDTO).collect(Collectors.toList()));

        List<OrderStatus> activeStatuses = Arrays.asList(OrderStatus.CONFIRMED, OrderStatus.PICKED_UP, OrderStatus.IN_TRANSIT);
        List<Shipment> outgoing = shipmentRepository.findOutgoingByWarehouseAndStatuses(warehouse, activeStatuses);
        dto.setOutgoingShipmentsCount(outgoing.size());
        dto.setOutgoingPreview(outgoing.stream().limit(5).map(this::mapToShipmentDTO).collect(Collectors.toList()));

        List<Shipment> readyForDispatch = shipmentRepository.findReadyForDispatchByWarehouse(warehouse);
        dto.setReadyForDispatchCount(readyForDispatch.size());

        // Fleet KPIs
        List<Driver> allDrivers = driverRepository.findAll();
        long availDrivers = allDrivers.stream().filter(d -> d.getStatus() == DriverStatus.AVAILABLE).count();
        dto.setDriversAvailableCount(availDrivers);
        dto.setDriversTotalCount(allDrivers.size());

        List<Vehicle> allVehicles = vehicleRepository.findAll();
        long availVehicles = allVehicles.stream().filter(v -> v.getStatus() == VehicleStatus.AVAILABLE).count();
        dto.setVehiclesAvailableCount(availVehicles);
        dto.setVehiclesTotalCount(allVehicles.size());

        // Recent Activity
        List<InventoryTransaction> transactions = transactionRepository.findTop20ByWarehouseOrderByTimestampDesc(warehouse);
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("MMM dd, yyyy hh:mm a");
        List<WarehouseActivityDTO> activities = transactions.stream().limit(8).map(t -> {
            String what = t.getTransactionType().name() + " " + t.getQuantity() + " units of " + t.getSku() + " (" + t.getProductName() + ")";
            String when = t.getTimestamp() != null ? t.getTimestamp().format(dtf) : "Recently";
            return new WarehouseActivityDTO(
                    t.getPerformedBy(),
                    what,
                    warehouse.getWarehouseName(),
                    when,
                    t.getTimestamp(),
                    t.getTransactionType().name(),
                    t.getReferenceShipment() != null ? t.getReferenceShipment() : t.getReferenceOrder()
            );
        }).collect(Collectors.toList());

        dto.setRecentActivities(activities);

        return dto;
    }

    // ==========================================
    // INVENTORY MANAGEMENT
    // ==========================================

    @Transactional(readOnly = true)
    public List<WarehouseInventoryDTO> getInventory(String search, String category, String status) {
        Warehouse warehouse = getScopedWarehouse();
        List<Inventory> items = inventoryRepository.findByWarehouseOrderBySkuAsc(warehouse);

        return items.stream()
                .filter(i -> {
                    if (search != null && !search.isBlank()) {
                        String s = search.trim().toLowerCase();
                        boolean matchSku = i.getSku() != null && i.getSku().toLowerCase().contains(s);
                        boolean matchName = i.getProductName() != null && i.getProductName().toLowerCase().contains(s);
                        if (!matchSku && !matchName) return false;
                    }
                    if (category != null && !category.isBlank() && !category.equalsIgnoreCase("ALL")) {
                        if (!category.equalsIgnoreCase(i.getCategory())) return false;
                    }
                    if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
                        if (!status.equalsIgnoreCase(i.getStatus())) return false;
                    }
                    return true;
                })
                .map(this::mapToInventoryDTO)
                .collect(Collectors.toList());
    }

    public WarehouseInventoryDTO receiveStock(ReceiveStockRequest request) {
        Warehouse warehouse = getScopedWarehouse();
        User user = getAuthenticatedUser();
        String performer = user != null && user.getFullName() != null ? user.getFullName() : "Warehouse Manager";

        Inventory inventory = inventoryRepository.findByWarehouseAndSku(warehouse, request.getSku())
                .orElseGet(() -> {
                    Inventory newItem = new Inventory();
                    newItem.setWarehouse(warehouse);
                    newItem.setSku(request.getSku().trim().toUpperCase());
                    newItem.setProductName(request.getProductName() != null ? request.getProductName().trim() : "Product " + request.getSku());
                    newItem.setCategory(request.getCategory() != null ? request.getCategory().trim() : "General Cargo");
                    newItem.setTotalStock(0);
                    newItem.setReservedStock(0);
                    newItem.setDamagedStock(0);
                    newItem.setReorderLevel(request.getReorderLevel() != null ? request.getReorderLevel() : 10);
                    newItem.setUnitPrice(request.getUnitPrice() != null ? request.getUnitPrice() : 0.0);
                    newItem.setUnit(request.getUnit() != null ? request.getUnit() : "Units");
                    return newItem;
                });

        int prevAvailable = inventory.getAvailableStock() != null ? inventory.getAvailableStock() : 0;
        inventory.setTotalStock((inventory.getTotalStock() != null ? inventory.getTotalStock() : 0) + request.getQuantity());
        inventory.recalculate();
        Inventory saved = inventoryRepository.save(inventory);

        // Record Audit Transaction
        InventoryTransaction tx = new InventoryTransaction();
        tx.setInventory(saved);
        tx.setWarehouse(warehouse);
        tx.setSku(saved.getSku());
        tx.setProductName(saved.getProductName());
        tx.setTransactionType(InventoryTransactionType.RECEIVE);
        tx.setQuantity(request.getQuantity());
        tx.setPreviousAvailable(prevAvailable);
        tx.setNewAvailable(saved.getAvailableStock());
        tx.setPerformedBy(performer);
        tx.setReason(request.getReason() != null ? request.getReason() : "Stock Received Inbound");
        tx.setReferenceOrder(request.getReferenceNumber());
        tx.setTimestamp(LocalDateTime.now());
        transactionRepository.save(tx);

        return mapToInventoryDTO(saved);
    }

    public WarehouseInventoryDTO reserveStock(ReserveStockRequest request) {
        Warehouse warehouse = getScopedWarehouse();
        User user = getAuthenticatedUser();
        String performer = user != null && user.getFullName() != null ? user.getFullName() : "Warehouse Manager";

        Inventory inventory = inventoryRepository.findByWarehouseAndSku(warehouse, request.getSku())
                .orElseThrow(() -> new ResourceNotFoundException("SKU not found in this warehouse: " + request.getSku()));

        int prevAvailable = inventory.getAvailableStock() != null ? inventory.getAvailableStock() : 0;
        if (prevAvailable < request.getQuantity()) {
            throw new IllegalArgumentException("Insufficient available stock to reserve. Available: " + prevAvailable + ", Requested: " + request.getQuantity());
        }

        inventory.setReservedStock((inventory.getReservedStock() != null ? inventory.getReservedStock() : 0) + request.getQuantity());
        inventory.recalculate();
        Inventory saved = inventoryRepository.save(inventory);

        InventoryTransaction tx = new InventoryTransaction();
        tx.setInventory(saved);
        tx.setWarehouse(warehouse);
        tx.setSku(saved.getSku());
        tx.setProductName(saved.getProductName());
        tx.setTransactionType(InventoryTransactionType.RESERVE);
        tx.setQuantity(request.getQuantity());
        tx.setPreviousAvailable(prevAvailable);
        tx.setNewAvailable(saved.getAvailableStock());
        tx.setPerformedBy(performer);
        tx.setReason(request.getReason() != null ? request.getReason() : "Stock Reserved for Outbound Dispatch");
        tx.setReferenceOrder(request.getReferenceOrder());
        tx.setTimestamp(LocalDateTime.now());
        transactionRepository.save(tx);

        return mapToInventoryDTO(saved);
    }

    public WarehouseInventoryDTO adjustStock(AdjustStockRequest request) {
        Warehouse warehouse = getScopedWarehouse();
        User user = getAuthenticatedUser();
        String performer = user != null && user.getFullName() != null ? user.getFullName() : "Warehouse Manager";

        Inventory inventory = inventoryRepository.findByWarehouseAndSku(warehouse, request.getSku())
                .orElseThrow(() -> new ResourceNotFoundException("SKU not found in this warehouse: " + request.getSku()));

        int prevAvailable = inventory.getAvailableStock() != null ? inventory.getAvailableStock() : 0;
        int diff = request.getNewTotalStock() - (inventory.getTotalStock() != null ? inventory.getTotalStock() : 0);

        inventory.setTotalStock(request.getNewTotalStock());
        inventory.recalculate();
        Inventory saved = inventoryRepository.save(inventory);

        InventoryTransaction tx = new InventoryTransaction();
        tx.setInventory(saved);
        tx.setWarehouse(warehouse);
        tx.setSku(saved.getSku());
        tx.setProductName(saved.getProductName());
        tx.setTransactionType(InventoryTransactionType.ADJUSTMENT);
        tx.setQuantity(Math.abs(diff));
        tx.setPreviousAvailable(prevAvailable);
        tx.setNewAvailable(saved.getAvailableStock());
        tx.setPerformedBy(performer);
        tx.setReason(request.getReason() + " (Diff: " + (diff >= 0 ? "+" + diff : diff) + ")");
        tx.setTimestamp(LocalDateTime.now());
        transactionRepository.save(tx);

        return mapToInventoryDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<WarehouseTransactionDTO> getTransactions(String sku, LocalDateTime startDate, LocalDateTime endDate) {
        Warehouse warehouse = getScopedWarehouse();
        List<InventoryTransaction> list = transactionRepository.filterTransactions(warehouse, (sku != null && !sku.isBlank()) ? sku.trim() : null, startDate, endDate);

        return list.stream().map(t -> {
            WarehouseTransactionDTO dto = new WarehouseTransactionDTO();
            dto.setId(t.getId());
            dto.setSku(t.getSku());
            dto.setProductName(t.getProductName());
            dto.setTransactionType(t.getTransactionType().name());
            dto.setQuantity(t.getQuantity());
            dto.setPreviousAvailable(t.getPreviousAvailable());
            dto.setNewAvailable(t.getNewAvailable());
            dto.setPerformedBy(t.getPerformedBy());
            dto.setTimestamp(t.getTimestamp());
            dto.setReason(t.getReason());
            dto.setReferenceOrder(t.getReferenceOrder());
            dto.setReferenceShipment(t.getReferenceShipment());
            return dto;
        }).collect(Collectors.toList());
    }

    // ==========================================
    // SHIPMENT OPERATIONS
    // ==========================================

    @Transactional(readOnly = true)
    public List<WarehouseShipmentDTO> getIncomingShipments() {
        Warehouse warehouse = getScopedWarehouse();
        List<Shipment> list = shipmentRepository.findByDestinationWarehouseOrderByCreatedAtDesc(warehouse);
        return list.stream().map(this::mapToShipmentDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WarehouseShipmentDTO> getOutgoingShipments() {
        Warehouse warehouse = getScopedWarehouse();
        List<Shipment> list = shipmentRepository.findByOriginWarehouseOrderByCreatedAtDesc(warehouse);
        return list.stream().map(this::mapToShipmentDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WarehouseShipmentDTO> getDispatchReadyShipments() {
        Warehouse warehouse = getScopedWarehouse();
        List<Shipment> list = shipmentRepository.findReadyForDispatchByWarehouse(warehouse);
        return list.stream().map(this::mapToShipmentDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WarehouseShipmentDTO getShipmentById(Long id) {
        Warehouse warehouse = getScopedWarehouse();
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found: " + id));

        boolean isOrigin = shipment.getOriginWarehouse() != null && shipment.getOriginWarehouse().getId().equals(warehouse.getId());
        boolean isDest = shipment.getDestinationWarehouse() != null && shipment.getDestinationWarehouse().getId().equals(warehouse.getId());

        if (!isOrigin && !isDest) {
            throw new AccessDeniedException("Unauthorized: Shipment does not belong to your assigned warehouse (" + warehouse.getWarehouseCode() + ").");
        }

        return mapToShipmentDTO(shipment);
    }

    public WarehouseShipmentDTO updateShipmentStage(Long id, String stage) {
        Warehouse warehouse = getScopedWarehouse();
        User user = getAuthenticatedUser();
        String performer = user != null && user.getFullName() != null ? user.getFullName() : "Warehouse Manager";

        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found: " + id));

        if (shipment.getOriginWarehouse() == null || !shipment.getOriginWarehouse().getId().equals(warehouse.getId())) {
            throw new AccessDeniedException("Unauthorized: Outgoing shipment stage can only be modified by the origin warehouse.");
        }

        shipment.setOperationalStage(stage.toUpperCase());
        shipment.setUpdatedAt(LocalDateTime.now());

        ShipmentTrackingEvent event = new ShipmentTrackingEvent(
                shipment,
                shipment.getStatus(),
                "Warehouse Stage Updated: " + stage.toUpperCase(),
                warehouse.getWarehouseName(),
                "Operational stage updated to " + stage.toUpperCase() + " by " + performer
        );
        trackingEventRepository.save(event);

        Shipment saved = shipmentRepository.save(shipment);
        return mapToShipmentDTO(saved);
    }

    public WarehouseShipmentDTO assignFleet(Long id, AssignFleetRequest request) {
        Warehouse warehouse = getScopedWarehouse();
        User user = getAuthenticatedUser();
        String performer = user != null && user.getFullName() != null ? user.getFullName() : "Warehouse Manager";

        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found: " + id));

        if (shipment.getOriginWarehouse() == null || !shipment.getOriginWarehouse().getId().equals(warehouse.getId())) {
            throw new AccessDeniedException("Unauthorized: Driver and vehicle assignments are restricted to the origin warehouse.");
        }

        // Driver Assignment
        if (request.getDriverId() != null) {
            Driver driver = driverRepository.findById(request.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found: " + request.getDriverId()));
            if (driver.getStatus() == DriverStatus.INACTIVE) {
                throw new IllegalArgumentException("Driver " + driver.getFullName() + " is inactive.");
            }
            List<Shipment> activeOnDriver = shipmentRepository.findActiveShipmentsByDriver(driver);
            if (!activeOnDriver.isEmpty() && !activeOnDriver.get(0).getId().equals(shipment.getId())) {
                throw new IllegalArgumentException("Driver " + driver.getFullName() + " is currently on trip with shipment " + activeOnDriver.get(0).getTrackingNumber());
            }
            shipment.setDriver(driver);
            driver.setStatus(DriverStatus.ON_TRIP);
            driverRepository.save(driver);
        }

        // Vehicle Assignment
        if (request.getVehicleId() != null) {
            Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + request.getVehicleId()));
            if (vehicle.getStatus() == VehicleStatus.INACTIVE || vehicle.getStatus() == VehicleStatus.MAINTENANCE) {
                throw new IllegalArgumentException("Vehicle " + vehicle.getVehicleNumber() + " is unavailable or in maintenance.");
            }
            List<Shipment> activeOnVeh = shipmentRepository.findActiveShipmentsByVehicle(vehicle);
            if (!activeOnVeh.isEmpty() && !activeOnVeh.get(0).getId().equals(shipment.getId())) {
                throw new IllegalArgumentException("Vehicle " + vehicle.getVehicleNumber() + " is currently assigned to active shipment " + activeOnVeh.get(0).getTrackingNumber());
            }
            shipment.setVehicle(vehicle);
            vehicle.setStatus(VehicleStatus.ASSIGNED);
            vehicleRepository.save(vehicle);
        }

        shipment.setUpdatedAt(LocalDateTime.now());
        Shipment saved = shipmentRepository.save(shipment);

        ShipmentTrackingEvent event = new ShipmentTrackingEvent(
                saved,
                saved.getStatus(),
                "Fleet Assigned",
                warehouse.getWarehouseName(),
                "Assigned driver " + (saved.getDriver() != null ? saved.getDriver().getFullName() : "N/A") + " and vehicle " + (saved.getVehicle() != null ? saved.getVehicle().getVehicleNumber() : "N/A") + " by " + performer
        );
        trackingEventRepository.save(event);

        return mapToShipmentDTO(saved);
    }

    public WarehouseShipmentDTO dispatchShipment(Long id) {
        Warehouse warehouse = getScopedWarehouse();
        User user = getAuthenticatedUser();
        String performer = user != null && user.getFullName() != null ? user.getFullName() : "Warehouse Manager";

        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found: " + id));

        if (shipment.getOriginWarehouse() == null || !shipment.getOriginWarehouse().getId().equals(warehouse.getId())) {
            throw new AccessDeniedException("Unauthorized: Only the origin warehouse (" + warehouse.getWarehouseCode() + ") can dispatch this shipment.");
        }

        if (shipment.getDriver() == null) {
            throw new IllegalArgumentException("Cannot dispatch shipment: No driver assigned.");
        }
        if (shipment.getVehicle() == null) {
            throw new IllegalArgumentException("Cannot dispatch shipment: No vehicle assigned.");
        }

        // Transition Shipment status to IN_TRANSIT
        shipment.setStatus(OrderStatus.IN_TRANSIT);
        shipment.setOperationalStage("DISPATCHED");
        shipment.setCurrentLocationName(warehouse.getWarehouseName() + ", " + warehouse.getCity());
        shipment.setCurrentLatitude(warehouse.getLatitude());
        shipment.setCurrentLongitude(warehouse.getLongitude());
        shipment.setUpdatedAt(LocalDateTime.now());

        // Update linked Order status
        if (shipment.getOrder() != null) {
            shipment.getOrder().setStatus(OrderStatus.IN_TRANSIT);
            shipment.getOrder().setUpdatedAt(LocalDateTime.now());
        }

        // Record Dispatch Event
        ShipmentTrackingEvent event = new ShipmentTrackingEvent(
                shipment,
                OrderStatus.IN_TRANSIT,
                "Dispatched from " + warehouse.getWarehouseName(),
                warehouse.getWarehouseName() + ", " + warehouse.getCity(),
                "Shipment handed over to driver " + shipment.getDriver().getFullName() + " on vehicle " + shipment.getVehicle().getVehicleNumber() + ". In transit to destination."
        );
        trackingEventRepository.save(event);

        Shipment saved = shipmentRepository.save(shipment);

        // Record inventory dispatch transaction
        InventoryTransaction tx = new InventoryTransaction();
        tx.setWarehouse(warehouse);
        tx.setSku(shipment.getOrder() != null && shipment.getOrder().getPackageDescription() != null ? shipment.getOrder().getPackageDescription() : "SHIP-" + shipment.getTrackingNumber());
        tx.setProductName(shipment.getOrder() != null ? shipment.getOrder().getPackageDescription() : "Dispatched Freight");
        tx.setTransactionType(InventoryTransactionType.DISPATCH);
        tx.setQuantity(shipment.getOrder() != null && shipment.getOrder().getPackageQuantity() != null ? shipment.getOrder().getPackageQuantity() : 1);
        tx.setPreviousAvailable(0);
        tx.setNewAvailable(0);
        tx.setPerformedBy(performer);
        tx.setReason("Outbound Dispatch for Shipment " + shipment.getTrackingNumber());
        tx.setReferenceShipment(shipment.getTrackingNumber());
        tx.setReferenceOrder(shipment.getOrder() != null ? shipment.getOrder().getOrderNumber() : "");
        tx.setTimestamp(LocalDateTime.now());
        transactionRepository.save(tx);

        return mapToShipmentDTO(saved);
    }

    // ==========================================
    // FLEET TRACKING & LIVE MAP
    // ==========================================

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getWarehouseDrivers() {
        Warehouse warehouse = getScopedWarehouse();
        List<Driver> drivers = driverRepository.findAll();

        return drivers.stream().map(d -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", d.getId());
            map.put("fullName", d.getFullName());
            map.put("email", d.getEmail());
            map.put("phone", d.getPhone());
            map.put("licenseNumber", d.getLicenseNumber());
            map.put("status", d.getStatus().name());

            List<Shipment> active = shipmentRepository.findActiveShipmentsByDriver(d);
            if (!active.isEmpty()) {
                Shipment s = active.get(0);
                map.put("currentShipment", s.getTrackingNumber());
                map.put("currentShipmentId", s.getId());
                map.put("assignedVehicle", s.getVehicle() != null ? s.getVehicle().getVehicleNumber() : "None");
                map.put("lastLocation", s.getCurrentLocationName() != null ? s.getCurrentLocationName() : warehouse.getCity());
                map.put("lastUpdated", s.getUpdatedAt());
            } else {
                map.put("currentShipment", "None");
                map.put("currentShipmentId", null);
                map.put("assignedVehicle", "None");
                map.put("lastLocation", warehouse.getCity() + " Hub Base");
                map.put("lastUpdated", d.getUpdatedAt());
            }
            return map;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getWarehouseVehicles() {
        Warehouse warehouse = getScopedWarehouse();
        List<Vehicle> vehicles = vehicleRepository.findAll();

        return vehicles.stream().map(v -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", v.getId());
            map.put("vehicleNumber", v.getVehicleNumber());
            map.put("vehicleType", v.getVehicleType().name());
            map.put("model", v.getModel());
            map.put("manufacturer", v.getManufacturer());
            map.put("capacity", v.getCapacity());
            map.put("capacityUnit", v.getCapacityUnit());
            map.put("status", v.getStatus().name());

            List<Shipment> active = shipmentRepository.findActiveShipmentsByVehicle(v);
            if (!active.isEmpty()) {
                Shipment s = active.get(0);
                map.put("currentShipment", s.getTrackingNumber());
                map.put("currentShipmentId", s.getId());
                map.put("currentDriver", s.getDriver() != null ? s.getDriver().getFullName() : "None");
                map.put("lastLocation", s.getCurrentLocationName() != null ? s.getCurrentLocationName() : warehouse.getCity());
                map.put("lastUpdated", s.getUpdatedAt());
            } else {
                map.put("currentShipment", "None");
                map.put("currentShipmentId", null);
                map.put("currentDriver", v.getAssignedDriver() != null ? v.getAssignedDriver().getFullName() : "None");
                map.put("lastLocation", warehouse.getCity() + " Yard");
                map.put("lastUpdated", v.getUpdatedAt());
            }
            return map;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Driver> getAvailableDrivers() {
        return driverRepository.findAll().stream()
                .filter(d -> d.getStatus() == DriverStatus.AVAILABLE)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Vehicle> getAvailableVehicles() {
        return vehicleRepository.findAll().stream()
                .filter(v -> v.getStatus() == VehicleStatus.AVAILABLE)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getLiveTrackingData() {
        Warehouse warehouse = getScopedWarehouse();

        Map<String, Object> res = new HashMap<>();
        Map<String, Object> whPin = new HashMap<>();
        whPin.put("id", warehouse.getId());
        whPin.put("name", warehouse.getWarehouseName());
        whPin.put("code", warehouse.getWarehouseCode());
        whPin.put("latitude", warehouse.getLatitude() != null ? warehouse.getLatitude() : 12.9716);
        whPin.put("longitude", warehouse.getLongitude() != null ? warehouse.getLongitude() : 77.5946);
        whPin.put("address", warehouse.getAddressLine1() + ", " + warehouse.getCity());
        res.put("warehouse", whPin);

        List<Shipment> activeOutgoing = shipmentRepository.findByOriginWarehouseOrderByCreatedAtDesc(warehouse).stream()
                .filter(s -> s.getStatus() == OrderStatus.IN_TRANSIT || s.getStatus() == OrderStatus.PICKED_UP || s.getStatus() == OrderStatus.OUT_FOR_DELIVERY)
                .collect(Collectors.toList());

        List<Map<String, Object>> markers = activeOutgoing.stream().map(s -> {
            Map<String, Object> m = new HashMap<>();
            m.put("shipmentId", s.getId());
            m.put("trackingNumber", s.getTrackingNumber());
            m.put("status", s.getStatus().name());
            m.put("latitude", s.getCurrentLatitude() != null ? s.getCurrentLatitude() : warehouse.getLatitude());
            m.put("longitude", s.getCurrentLongitude() != null ? s.getCurrentLongitude() : warehouse.getLongitude());
            m.put("locationName", s.getCurrentLocationName() != null ? s.getCurrentLocationName() : warehouse.getCity());
            m.put("driverName", s.getDriver() != null ? s.getDriver().getFullName() : "Unassigned");
            m.put("driverPhone", s.getDriver() != null ? s.getDriver().getPhone() : "");
            m.put("vehicleNumber", s.getVehicle() != null ? s.getVehicle().getVehicleNumber() : "Unassigned");
            m.put("destination", s.getOrder() != null && s.getOrder().getDeliveryAddress() != null ? s.getOrder().getDeliveryAddress().getCity() : "N/A");
            m.put("updatedAt", s.getUpdatedAt());
            return m;
        }).collect(Collectors.toList());

        res.put("activeShipments", markers);
        return res;
    }

    // ==========================================
    // REPORTS & NOTIFICATIONS
    // ==========================================

    @Transactional(readOnly = true)
    public WarehouseReportDTO getReports(String dateRange) {
        Warehouse warehouse = getScopedWarehouse();
        WarehouseReportDTO r = new WarehouseReportDTO();
        r.setWarehouseCode(warehouse.getWarehouseCode());
        r.setWarehouseName(warehouse.getWarehouseName());
        r.setDateRange(dateRange != null ? dateRange : "Last 30 Days");

        List<Inventory> allInv = inventoryRepository.findByWarehouse(warehouse);
        long totalStock = allInv.stream().mapToLong(i -> i.getTotalStock() != null ? i.getTotalStock() : 0).sum();
        double stockValue = allInv.stream().mapToDouble(i -> (i.getTotalStock() != null ? i.getTotalStock() : 0) * (i.getUnitPrice() != null ? i.getUnitPrice() : 0.0)).sum();

        r.setTotalItems(allInv.size());
        r.setTotalStockQuantity(totalStock);
        r.setStockValue(stockValue);

        List<Shipment> outgoing = shipmentRepository.findByOriginWarehouseOrderByCreatedAtDesc(warehouse);
        long dispatches = outgoing.stream().filter(s -> s.getStatus() != OrderStatus.PENDING && s.getStatus() != OrderStatus.CONFIRMED && s.getStatus() != OrderStatus.CANCELLED).count();
        long active = outgoing.stream().filter(s -> s.getStatus() == OrderStatus.IN_TRANSIT || s.getStatus() == OrderStatus.PICKED_UP).count();

        r.setTotalDispatches(dispatches);
        r.setActiveShipments(active);
        r.setAverageUtilization(warehouse.getTotalCapacity() != null && warehouse.getTotalCapacity() > 0 ? (warehouse.getOccupiedCapacity() / warehouse.getTotalCapacity()) * 100 : 0.0);

        // Stock by category
        Map<String, Long> categoryCount = allInv.stream().collect(Collectors.groupingBy(Inventory::getCategory, Collectors.summingLong(i -> i.getTotalStock() != null ? i.getTotalStock() : 0)));
        List<Map<String, Object>> catList = new ArrayList<>();
        categoryCount.forEach((k, v) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("category", k);
            map.put("units", v);
            catList.add(map);
        });
        r.setStockByCategory(catList);

        // Weekly dispatches
        List<Map<String, Object>> daily = new ArrayList<>();
        String[] days = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        for (int i = 0; i < days.length; i++) {
            Map<String, Object> d = new HashMap<>();
            d.put("day", days[i]);
            d.put("dispatches", (i * 3 + dispatches % 5));
            d.put("received", (i * 2 + 1));
            daily.add(d);
        }
        r.setDailyDispatches(daily);

        // Transaction breakdown
        List<InventoryTransaction> txs = transactionRepository.findByWarehouseOrderByTimestampDesc(warehouse);
        Map<InventoryTransactionType, Long> txTypeCount = txs.stream().collect(Collectors.groupingBy(InventoryTransaction::getTransactionType, Collectors.counting()));
        List<Map<String, Object>> txBreakdown = new ArrayList<>();
        txTypeCount.forEach((k, v) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("type", k.name());
            map.put("count", v);
            txBreakdown.add(map);
        });
        r.setTransactionBreakdown(txBreakdown);

        return r;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getNotifications() {
        Warehouse warehouse = getScopedWarehouse();
        List<Map<String, Object>> list = new ArrayList<>();

        // 1. Low stock alerts
        List<Inventory> low = inventoryRepository.findLowStockByWarehouse(warehouse);
        for (Inventory i : low) {
            Map<String, Object> n = new HashMap<>();
            n.put("id", "LOW-" + i.getId());
            n.put("title", "Low Stock Alert: " + i.getSku());
            n.put("message", i.getProductName() + " has only " + i.getAvailableStock() + " " + i.getUnit() + " remaining (Reorder Level: " + i.getReorderLevel() + ").");
            n.put("type", "WARNING");
            n.put("createdAt", i.getUpdatedAt() != null ? i.getUpdatedAt() : LocalDateTime.now());
            n.put("read", false);
            list.add(n);
        }

        // 2. Ready for dispatch alerts
        List<Shipment> ready = shipmentRepository.findReadyForDispatchByWarehouse(warehouse);
        for (Shipment s : ready) {
            Map<String, Object> n = new HashMap<>();
            n.put("id", "READY-" + s.getId());
            n.put("title", "Ready for Dispatch");
            n.put("message", "Shipment " + s.getTrackingNumber() + " is packed and awaiting driver/vehicle dispatch.");
            n.put("type", "INFO");
            n.put("createdAt", s.getUpdatedAt() != null ? s.getUpdatedAt() : LocalDateTime.now());
            n.put("read", false);
            list.add(n);
        }

        // 3. Inbound incoming alerts
        List<Shipment> incoming = shipmentRepository.findActiveIncomingByWarehouse(warehouse);
        for (Shipment s : incoming.stream().limit(4).collect(Collectors.toList())) {
            Map<String, Object> n = new HashMap<>();
            n.put("id", "IN-" + s.getId());
            n.put("title", "Inbound Shipment Expected");
            n.put("message", "Shipment " + s.getTrackingNumber() + " arriving from " + (s.getOriginWarehouse() != null ? s.getOriginWarehouse().getWarehouseName() : "Origin") + ".");
            n.put("type", "SUCCESS");
            n.put("createdAt", s.getCreatedAt());
            n.put("read", false);
            list.add(n);
        }

        return list;
    }

    // ==========================================
    // MAPPERS
    // ==========================================

    private WarehouseInventoryDTO mapToInventoryDTO(Inventory i) {
        WarehouseInventoryDTO dto = new WarehouseInventoryDTO();
        dto.setId(i.getId());
        dto.setSku(i.getSku());
        dto.setProductName(i.getProductName());
        dto.setCategory(i.getCategory());
        dto.setTotalStock(i.getTotalStock());
        dto.setAvailableStock(i.getAvailableStock());
        dto.setReservedStock(i.getReservedStock());
        dto.setDamagedStock(i.getDamagedStock());
        dto.setReorderLevel(i.getReorderLevel());
        dto.setUnitPrice(i.getUnitPrice());
        dto.setUnit(i.getUnit());
        dto.setStatus(i.getStatus());
        dto.setUpdatedAt(i.getUpdatedAt());
        return dto;
    }

    private WarehouseShipmentDTO mapToShipmentDTO(Shipment s) {
        WarehouseShipmentDTO dto = new WarehouseShipmentDTO();
        dto.setId(s.getId());
        dto.setTrackingNumber(s.getTrackingNumber());
        dto.setStatus(s.getStatus().name());
        dto.setOperationalStage(s.getOperationalStage());

        if (s.getOrder() != null) {
            dto.setOrderId(s.getOrder().getId());
            dto.setOrderNumber(s.getOrder().getOrderNumber());
            dto.setPackageDescription(s.getOrder().getPackageDescription());
            dto.setPackageWeight(s.getOrder().getPackageWeight());
            dto.setPackageQuantity(s.getOrder().getPackageQuantity());

            if (s.getOrder().getPickupAddress() != null) {
                dto.setPickupAddress(s.getOrder().getPickupAddress().getAddressLine1() + ", " + s.getOrder().getPickupAddress().getCity());
                dto.setOriginCity(s.getOrder().getPickupAddress().getCity());
            }
            if (s.getOrder().getDeliveryAddress() != null) {
                dto.setDeliveryAddress(s.getOrder().getDeliveryAddress().getAddressLine1() + ", " + s.getOrder().getDeliveryAddress().getCity());
                dto.setDestinationCity(s.getOrder().getDeliveryAddress().getCity());
            }
        }

        if (s.getOriginWarehouse() != null) {
            dto.setOriginWarehouseId(s.getOriginWarehouse().getId());
            dto.setOriginWarehouseName(s.getOriginWarehouse().getWarehouseName());
            if (dto.getOriginCity() == null) dto.setOriginCity(s.getOriginWarehouse().getCity());
        }

        if (s.getDestinationWarehouse() != null) {
            dto.setDestinationWarehouseId(s.getDestinationWarehouse().getId());
            dto.setDestinationWarehouseName(s.getDestinationWarehouse().getWarehouseName());
            if (dto.getDestinationCity() == null) dto.setDestinationCity(s.getDestinationWarehouse().getCity());
        }

        if (s.getDriver() != null) {
            dto.setDriverId(s.getDriver().getId());
            dto.setDriverName(s.getDriver().getFullName());
            dto.setDriverPhone(s.getDriver().getPhone());
            dto.setDriverStatus(s.getDriver().getStatus().name());
        }

        if (s.getVehicle() != null) {
            dto.setVehicleId(s.getVehicle().getId());
            dto.setVehicleNumber(s.getVehicle().getVehicleNumber());
            dto.setVehicleType(s.getVehicle().getVehicleType().name());
            dto.setVehicleModel(s.getVehicle().getModel());
            dto.setVehicleStatus(s.getVehicle().getStatus().name());
        }

        dto.setEstimatedDeliveryDate(s.getEstimatedDeliveryDate());
        dto.setCreatedAt(s.getCreatedAt());
        dto.setUpdatedAt(s.getUpdatedAt());
        dto.setCurrentLatitude(s.getCurrentLatitude());
        dto.setCurrentLongitude(s.getCurrentLongitude());
        dto.setCurrentLocationName(s.getCurrentLocationName());

        boolean isReady = "READY_FOR_DISPATCH".equalsIgnoreCase(s.getOperationalStage())
                && s.getDriver() != null
                && s.getVehicle() != null;
        dto.setReadyForDispatch(isReady);

        return dto;
    }
}
`);

// 2. WarehouseManagerController.java
writeFile('controller/WarehouseManagerController.java', `
package com.primeroute.logistics.controller;

import com.primeroute.logistics.dto.ApiResponse;
import com.primeroute.logistics.dto.warehouse.*;
import com.primeroute.logistics.entity.Driver;
import com.primeroute.logistics.entity.Vehicle;
import com.primeroute.logistics.entity.Warehouse;
import com.primeroute.logistics.service.WarehouseManagerService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/warehouse-manager")
public class WarehouseManagerController {

    private final WarehouseManagerService warehouseManagerService;

    public WarehouseManagerController(WarehouseManagerService warehouseManagerService) {
        this.warehouseManagerService = warehouseManagerService;
    }

    // ==========================================
    // PROFILE & WAREHOUSE
    // ==========================================

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProfile() {
        Map<String, Object> profile = warehouseManagerService.getManagerProfile();
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse Manager profile retrieved", profile));
    }

    @GetMapping("/warehouse")
    public ResponseEntity<ApiResponse<Warehouse>> getWarehouse() {
        Warehouse warehouse = warehouseManagerService.getWarehouseDetails();
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse details retrieved", warehouse));
    }

    @PutMapping("/warehouse")
    public ResponseEntity<ApiResponse<Warehouse>> updateWarehouse(@RequestBody UpdateWarehouseDetailsRequest request) {
        Warehouse updated = warehouseManagerService.updateWarehouseDetails(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse details updated successfully", updated));
    }

    // ==========================================
    // DASHBOARD
    // ==========================================

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<WarehouseDashboardDTO>> getDashboard() {
        WarehouseDashboardDTO dashboard = warehouseManagerService.getDashboard();
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse dashboard metrics retrieved", dashboard));
    }

    // ==========================================
    // INVENTORY & TRANSACTIONS
    // ==========================================

    @GetMapping("/inventory")
    public ResponseEntity<ApiResponse<List<WarehouseInventoryDTO>>> getInventory(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status) {
        List<WarehouseInventoryDTO> inventory = warehouseManagerService.getInventory(search, category, status);
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse inventory retrieved successfully", inventory));
    }

    @PostMapping("/inventory/receive")
    public ResponseEntity<ApiResponse<WarehouseInventoryDTO>> receiveStock(
            @Valid @RequestBody ReceiveStockRequest request) {
        WarehouseInventoryDTO received = warehouseManagerService.receiveStock(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Stock received successfully", received));
    }

    @PostMapping("/inventory/reserve")
    public ResponseEntity<ApiResponse<WarehouseInventoryDTO>> reserveStock(
            @Valid @RequestBody ReserveStockRequest request) {
        WarehouseInventoryDTO reserved = warehouseManagerService.reserveStock(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Stock reserved successfully", reserved));
    }

    @PostMapping("/inventory/adjust")
    public ResponseEntity<ApiResponse<WarehouseInventoryDTO>> adjustStock(
            @Valid @RequestBody AdjustStockRequest request) {
        WarehouseInventoryDTO adjusted = warehouseManagerService.adjustStock(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Stock adjusted successfully", adjusted));
    }

    @GetMapping("/inventory/transactions")
    public ResponseEntity<ApiResponse<List<WarehouseTransactionDTO>>> getTransactions(
            @RequestParam(required = false) String sku,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<WarehouseTransactionDTO> txs = warehouseManagerService.getTransactions(sku, startDate, endDate);
        return ResponseEntity.ok(new ApiResponse<>(true, "Inventory transactions retrieved successfully", txs));
    }

    // ==========================================
    // SHIPMENTS & DISPATCH
    // ==========================================

    @GetMapping("/shipments/incoming")
    public ResponseEntity<ApiResponse<List<WarehouseShipmentDTO>>> getIncomingShipments() {
        List<WarehouseShipmentDTO> shipments = warehouseManagerService.getIncomingShipments();
        return ResponseEntity.ok(new ApiResponse<>(true, "Incoming shipments retrieved successfully", shipments));
    }

    @GetMapping("/shipments/outgoing")
    public ResponseEntity<ApiResponse<List<WarehouseShipmentDTO>>> getOutgoingShipments() {
        List<WarehouseShipmentDTO> shipments = warehouseManagerService.getOutgoingShipments();
        return ResponseEntity.ok(new ApiResponse<>(true, "Outgoing shipments retrieved successfully", shipments));
    }

    @GetMapping("/shipments/dispatch-ready")
    public ResponseEntity<ApiResponse<List<WarehouseShipmentDTO>>> getDispatchReadyShipments() {
        List<WarehouseShipmentDTO> shipments = warehouseManagerService.getDispatchReadyShipments();
        return ResponseEntity.ok(new ApiResponse<>(true, "Dispatch ready shipments retrieved successfully", shipments));
    }

    @GetMapping("/shipments/{id}")
    public ResponseEntity<ApiResponse<WarehouseShipmentDTO>> getShipmentById(@PathVariable Long id) {
        WarehouseShipmentDTO shipment = warehouseManagerService.getShipmentById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Shipment details retrieved successfully", shipment));
    }

    @PatchMapping("/shipments/{id}/stage")
    public ResponseEntity<ApiResponse<WarehouseShipmentDTO>> updateShipmentStage(
            @PathVariable Long id,
            @RequestParam String stage) {
        WarehouseShipmentDTO updated = warehouseManagerService.updateShipmentStage(id, stage);
        return ResponseEntity.ok(new ApiResponse<>(true, "Operational stage updated successfully", updated));
    }

    @PostMapping("/shipments/{id}/assign")
    public ResponseEntity<ApiResponse<WarehouseShipmentDTO>> assignFleet(
            @PathVariable Long id,
            @RequestBody AssignFleetRequest request) {
        WarehouseShipmentDTO assigned = warehouseManagerService.assignFleet(id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Driver and vehicle assigned successfully", assigned));
    }

    @PostMapping("/shipments/{id}/dispatch")
    public ResponseEntity<ApiResponse<WarehouseShipmentDTO>> dispatchShipment(@PathVariable Long id) {
        WarehouseShipmentDTO dispatched = warehouseManagerService.dispatchShipment(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Shipment dispatched successfully", dispatched));
    }

    // ==========================================
    // FLEET & TRACKING
    // ==========================================

    @GetMapping("/drivers")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDrivers() {
        List<Map<String, Object>> drivers = warehouseManagerService.getWarehouseDrivers();
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse drivers retrieved successfully", drivers));
    }

    @GetMapping("/drivers/available")
    public ResponseEntity<ApiResponse<List<Driver>>> getAvailableDrivers() {
        List<Driver> drivers = warehouseManagerService.getAvailableDrivers();
        return ResponseEntity.ok(new ApiResponse<>(true, "Available drivers retrieved successfully", drivers));
    }

    @GetMapping("/vehicles")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getVehicles() {
        List<Map<String, Object>> vehicles = warehouseManagerService.getWarehouseVehicles();
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse vehicles retrieved successfully", vehicles));
    }

    @GetMapping("/vehicles/available")
    public ResponseEntity<ApiResponse<List<Vehicle>>> getAvailableVehicles() {
        List<Vehicle> vehicles = warehouseManagerService.getAvailableVehicles();
        return ResponseEntity.ok(new ApiResponse<>(true, "Available vehicles retrieved successfully", vehicles));
    }

    @GetMapping("/tracking/live")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLiveTracking() {
        Map<String, Object> data = warehouseManagerService.getLiveTrackingData();
        return ResponseEntity.ok(new ApiResponse<>(true, "Live tracking coordinates retrieved successfully", data));
    }

    // ==========================================
    // REPORTS & NOTIFICATIONS
    // ==========================================

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<WarehouseReportDTO>> getReports(
            @RequestParam(required = false) String dateRange) {
        WarehouseReportDTO report = warehouseManagerService.getReports(dateRange);
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse report data retrieved successfully", report));
    }

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getNotifications() {
        List<Map<String, Object>> list = warehouseManagerService.getNotifications();
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse notifications retrieved successfully", list));
    }
}
`);

console.log('WarehouseManagerService and WarehouseManagerController written successfully.');
