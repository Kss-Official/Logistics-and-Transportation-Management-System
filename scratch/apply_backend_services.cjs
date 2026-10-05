const fs = require('fs');
const path = require('path');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

// 1. Update AdminVehicleService.java
const vehSvcPath = path.join(BACKEND_BASE, 'service', 'AdminVehicleService.java');
let vehSvc = fs.readFileSync(vehSvcPath, 'utf8');

if (!vehSvc.includes('WarehouseRepository')) {
  vehSvc = vehSvc.replace(
    'import com.primeroute.logistics.repository.VehicleRepository;',
    'import com.primeroute.logistics.repository.VehicleRepository;\nimport com.primeroute.logistics.repository.WarehouseRepository;'
  );
  vehSvc = vehSvc.replace(
    'private final UserRepository userRepository;',
    'private final UserRepository userRepository;\n    private final WarehouseRepository warehouseRepository;'
  );
  vehSvc = vehSvc.replace(
    'UserRepository userRepository) {',
    'UserRepository userRepository,\n                               WarehouseRepository warehouseRepository) {'
  );
  vehSvc = vehSvc.replace(
    'this.userRepository = userRepository;',
    'this.userRepository = userRepository;\n        this.warehouseRepository = warehouseRepository;'
  );

  // In createVehicle:
  vehSvc = vehSvc.replace(
    'v.setStatus(VehicleStatus.AVAILABLE);',
    `v.setStatus(VehicleStatus.AVAILABLE);
        if (req.getWarehouseId() != null) {
            warehouseRepository.findById(req.getWarehouseId()).ifPresent(v::setWarehouse);
        }`
  );

  // In updateVehicle:
  vehSvc = vehSvc.replace(
    'v.setModel(req.getModel().trim());',
    `v.setModel(req.getModel().trim());
        if (req.getWarehouseId() != null) {
            v.setWarehouse(warehouseRepository.findById(req.getWarehouseId()).orElse(null));
        } else {
            v.setWarehouse(null);
        }`
  );

  // In convertToDTO:
  vehSvc = vehSvc.replace(
    'dto.setCurrentLocation(v.getCurrentLocation() != null ? v.getCurrentLocation() : "");',
    `dto.setCurrentLocation(v.getCurrentLocation() != null ? v.getCurrentLocation() : "");
        if (v.getWarehouse() != null) {
            dto.setWarehouseId(v.getWarehouse().getId());
            dto.setWarehouseName(v.getWarehouse().getWarehouseName());
        }`
  );

  fs.writeFileSync(vehSvcPath, vehSvc, 'utf8');
  console.log('Updated AdminVehicleService.java');
}

// 2. Update AdminDriverService.java
const driverSvcPath = path.join(BACKEND_BASE, 'service', 'AdminDriverService.java');
let driverSvc = fs.readFileSync(driverSvcPath, 'utf8');

if (!driverSvc.includes('WarehouseRepository')) {
  driverSvc = driverSvc.replace(
    'import com.primeroute.logistics.repository.DriverRepository;',
    'import com.primeroute.logistics.repository.DriverRepository;\nimport com.primeroute.logistics.repository.VehicleRepository;\nimport com.primeroute.logistics.repository.WarehouseRepository;\nimport com.primeroute.logistics.entity.Vehicle;'
  );
  driverSvc = driverSvc.replace(
    'private final PasswordEncoder passwordEncoder;',
    'private final PasswordEncoder passwordEncoder;\n    private final WarehouseRepository warehouseRepository;\n    private final VehicleRepository vehicleRepository;'
  );
  driverSvc = driverSvc.replace(
    'PasswordEncoder passwordEncoder) {',
    'PasswordEncoder passwordEncoder,\n            WarehouseRepository warehouseRepository,\n            VehicleRepository vehicleRepository) {'
  );
  driverSvc = driverSvc.replace(
    'this.passwordEncoder = passwordEncoder;',
    'this.passwordEncoder = passwordEncoder;\n        this.warehouseRepository = warehouseRepository;\n        this.vehicleRepository = vehicleRepository;'
  );

  // In createDriver:
  driverSvc = driverSvc.replace(
    'driver.setStatus(request.getStatus() != null ? request.getStatus() : DriverStatus.AVAILABLE);',
    `driver.setStatus(request.getStatus() != null ? request.getStatus() : DriverStatus.AVAILABLE);
        if (request.getWarehouseId() != null) {
            warehouseRepository.findById(request.getWarehouseId()).ifPresent(driver::setWarehouse);
        }`
  );

  // In updateDriver:
  driverSvc = driverSvc.replace(
    'driver.setAddress(request.getAddress() != null ? request.getAddress().trim() : null);',
    `driver.setAddress(request.getAddress() != null ? request.getAddress().trim() : null);
        if (request.getWarehouseId() != null) {
            driver.setWarehouse(warehouseRepository.findById(request.getWarehouseId()).orElse(null));
        } else {
            driver.setWarehouse(null);
        }`
  );

  // In convertToDto:
  driverSvc = driverSvc.replace(
    'dto.setUpdatedAt(driver.getUpdatedAt());',
    `dto.setUpdatedAt(driver.getUpdatedAt());
        if (driver.getWarehouse() != null) {
            dto.setWarehouseId(driver.getWarehouse().getId());
            dto.setWarehouseName(driver.getWarehouse().getWarehouseName());
        }
        List<Vehicle> linkedVehicles = vehicleRepository.findByAssignedDriver(driver);
        if (!linkedVehicles.isEmpty()) {
            dto.setVehicleId(linkedVehicles.get(0).getId());
            dto.setVehicleNumber(linkedVehicles.get(0).getVehicleNumber());
        }`
  );

  driverSvc = driverSvc.replace(
    'dto.setAssignedShipmentNumbers(activeTrackingNos);',
    `dto.setAssignedShipmentNumbers(activeTrackingNos);
        if (!activeTrackingNos.isEmpty()) {
            dto.setCurrentShipmentTrackingNumber(activeTrackingNos.get(0));
        }`
  );

  fs.writeFileSync(driverSvcPath, driverSvc, 'utf8');
  console.log('Updated AdminDriverService.java');
}

// 3. Update AdminWarehouseService.java
const whSvcPath = path.join(BACKEND_BASE, 'service', 'AdminWarehouseService.java');
let whSvc = fs.readFileSync(whSvcPath, 'utf8');

if (!whSvc.includes('driverRepository.countByWarehouseAndStatus')) {
  if (!whSvc.includes('DriverRepository')) {
    whSvc = whSvc.replace(
      'import com.primeroute.logistics.repository.WarehouseRepository;',
      'import com.primeroute.logistics.repository.WarehouseRepository;\nimport com.primeroute.logistics.repository.DriverRepository;\nimport com.primeroute.logistics.repository.VehicleRepository;\nimport com.primeroute.logistics.entity.DriverStatus;\nimport com.primeroute.logistics.entity.VehicleStatus;'
    );
    whSvc = whSvc.replace(
      'private final RouteRepository routeRepository;',
      'private final RouteRepository routeRepository;\n    private final DriverRepository driverRepository;\n    private final VehicleRepository vehicleRepository;'
    );
    whSvc = whSvc.replace(
      'RouteRepository routeRepository) {',
      'RouteRepository routeRepository,\n                                 DriverRepository driverRepository,\n                                 VehicleRepository vehicleRepository) {'
    );
    whSvc = whSvc.replace(
      'this.routeRepository = routeRepository;',
      'this.routeRepository = routeRepository;\n        this.driverRepository = driverRepository;\n        this.vehicleRepository = vehicleRepository;'
    );
  }

  whSvc = whSvc.replace(
    'dto.setActiveRouteCount(activeRoutes);',
    `dto.setActiveRouteCount(activeRoutes);

        long availDrivers = driverRepository.countByWarehouseAndStatus(w, DriverStatus.AVAILABLE);
        long availVehicles = vehicleRepository.countByWarehouseAndStatus(w, VehicleStatus.AVAILABLE);
        dto.setAvailableDriverCount(availDrivers);
        dto.setAvailableVehicleCount(availVehicles);`
  );

  fs.writeFileSync(whSvcPath, whSvc, 'utf8');
  console.log('Updated AdminWarehouseService.java');
}

// 4. Update AdminDashboardService.java
const dashSvcPath = path.join(BACKEND_BASE, 'service', 'AdminDashboardService.java');
const newDashSvcContent = `package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.*;
import com.primeroute.logistics.entity.*;
import com.primeroute.logistics.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    private final OrderRepository orderRepository;
    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final WarehouseRepository warehouseRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final InventoryRepository inventoryRepository;

    public AdminDashboardService(
            OrderRepository orderRepository,
            ShipmentRepository shipmentRepository,
            UserRepository userRepository,
            SupportTicketRepository supportTicketRepository,
            WarehouseRepository warehouseRepository,
            DriverRepository driverRepository,
            VehicleRepository vehicleRepository,
            InventoryRepository inventoryRepository) {
        this.orderRepository = orderRepository;
        this.shipmentRepository = shipmentRepository;
        this.userRepository = userRepository;
        this.supportTicketRepository = supportTicketRepository;
        this.warehouseRepository = warehouseRepository;
        this.driverRepository = driverRepository;
        this.vehicleRepository = vehicleRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Transactional(readOnly = true)
    public AdminDashboardSummaryDTO getSummary() {
        long totalOrders = orderRepository.count();
        long totalShipments = shipmentRepository.count();
        long totalCustomers = userRepository.countByRole(Role.CUSTOMER);

        Double revenueVal = orderRepository.sumTotalRevenueExcludingCancelled();
        double totalRevenue = (revenueVal != null) ? revenueVal : 0.0;

        // Dynamic status distribution from OrderStatus enum
        Map<String, Long> statusMap = new LinkedHashMap<>();
        for (OrderStatus st : OrderStatus.values()) {
            statusMap.put(st.name(), orderRepository.countByStatus(st));
        }

        // Recent Orders
        List<Order> recentOrderEntities = orderRepository.findTop5ByOrderByCreatedAtDesc();
        List<AdminRecentOrderDTO> recentOrders = recentOrderEntities.stream().map(order -> {
            String customerName = order.getCustomer() != null ? order.getCustomer().getFullName() : "Guest User";
            String customerEmail = order.getCustomer() != null ? order.getCustomer().getEmail() : "";
            String destination = order.getDeliveryAddress() != null
                    ? order.getDeliveryAddress().getCity() + ", " + order.getDeliveryAddress().getState()
                    : "Destination";
            double amount = order.getTotalAmount() != null ? order.getTotalAmount() : 0.0;

            return new AdminRecentOrderDTO(
                    order.getId(),
                    order.getOrderNumber(),
                    customerName,
                    customerEmail,
                    destination,
                    order.getStatus().name(),
                    amount,
                    order.getCreatedAt()
            );
        }).collect(Collectors.toList());

        // Recent Shipments
        List<Shipment> recentShipmentEntities = shipmentRepository.findTop5ByOrderByCreatedAtDesc();
        List<AdminRecentShipmentDTO> recentShipments = recentShipmentEntities.stream().map(shipment -> {
            String origin = "Origin Hub";
            String dest = "Destination Hub";
            String route = "Direct Linehaul";
            String orderNum = "";

            if (shipment.getOrder() != null) {
                orderNum = shipment.getOrder().getOrderNumber();
                if (shipment.getOrder().getPickupAddress() != null) {
                    origin = shipment.getOrder().getPickupAddress().getCity();
                }
                if (shipment.getOrder().getDeliveryAddress() != null) {
                    dest = shipment.getOrder().getDeliveryAddress().getCity();
                }
                route = origin + " → " + dest;
            }

            return new AdminRecentShipmentDTO(
                    shipment.getId(),
                    shipment.getTrackingNumber(),
                    orderNum,
                    origin,
                    dest,
                    route,
                    shipment.getStatus().name(),
                    shipment.getCurrentLocationName() != null ? shipment.getCurrentLocationName() : origin,
                    shipment.getCreatedAt()
            );
        }).collect(Collectors.toList());

        // Dynamic Top Routes
        List<Shipment> allShipments = shipmentRepository.findAll();
        Map<String, Long> routeCounts = new LinkedHashMap<>();
        for (Shipment s : allShipments) {
            String origin = "Origin Hub";
            String dest = "Destination Hub";
            if (s.getOrder() != null) {
                if (s.getOrder().getPickupAddress() != null && s.getOrder().getPickupAddress().getCity() != null) {
                    origin = s.getOrder().getPickupAddress().getCity();
                }
                if (s.getOrder().getDeliveryAddress() != null && s.getOrder().getDeliveryAddress().getCity() != null) {
                    dest = s.getOrder().getDeliveryAddress().getCity();
                }
            }
            String route = origin + " → " + dest;
            routeCounts.put(route, routeCounts.getOrDefault(route, 0L) + 1L);
        }
        List<AdminRouteStatDTO> topRoutes = routeCounts.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(5)
                .map(e -> new AdminRouteStatDTO(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        // Dynamic Top Customers
        List<Order> allOrders = orderRepository.findAll();
        Map<String, Long> customerCounts = new LinkedHashMap<>();
        for (Order o : allOrders) {
            String cName = (o.getCustomer() != null && o.getCustomer().getFullName() != null)
                    ? o.getCustomer().getFullName()
                    : "Customer";
            customerCounts.put(cName, customerCounts.getOrDefault(cName, 0L) + 1L);
        }
        List<AdminCustomerStatDTO> topCustomers = customerCounts.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(5)
                .map(e -> new AdminCustomerStatDTO(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        // Dynamic Monthly Stats (Past 6 Months)
        YearMonth currentYm = YearMonth.now();
        List<MonthlyRevenueStatDTO> monthlyStats = new ArrayList<>();
        DateTimeFormatter mFormatter = DateTimeFormatter.ofPattern("MMM");

        for (int i = 5; i >= 0; i--) {
            YearMonth ym = currentYm.minusMonths(i);
            LocalDateTime startOfMonth = ym.atDay(1).atStartOfDay();
            LocalDateTime endOfMonth = ym.atEndOfMonth().atTime(23, 59, 59);

            double monthRev = 0.0;
            long monthOrders = 0;
            long monthDelivered = 0;

            for (Order o : allOrders) {
                if (o.getCreatedAt() != null && !o.getCreatedAt().isBefore(startOfMonth) && !o.getCreatedAt().isAfter(endOfMonth)) {
                    monthOrders++;
                    if (o.getStatus() != OrderStatus.CANCELLED && o.getTotalAmount() != null) {
                        monthRev += o.getTotalAmount();
                    }
                    if (o.getStatus() == OrderStatus.DELIVERED) {
                        monthDelivered++;
                    }
                }
            }
            monthlyStats.add(new MonthlyRevenueStatDTO(ym.format(mFormatter), monthRev, monthOrders, monthDelivered));
        }

        // Tickets count
        long totalTickets = supportTicketRepository.count();
        List<SupportTicket> allTickets = supportTicketRepository.findAll();
        long openTickets = allTickets.stream()
                .filter(t -> !"RESOLVED".equalsIgnoreCase(t.getStatus()) && !"CLOSED".equalsIgnoreCase(t.getStatus()))
                .count();

        // Real-time Fleet & Operations Telemetry
        long pendingReview = orderRepository.countByStatus(OrderStatus.PENDING);
        long unassignedOrders = allOrders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED && o.getStatus() != OrderStatus.DELIVERED)
                .filter(o -> o.getShipment() == null)
                .count();

        long processingShipments = allShipments.stream()
                .filter(s -> "READY_FOR_PROCESSING".equalsIgnoreCase(s.getOperationalStage()) || 
                             "Awaiting Warehouse Assignment".equalsIgnoreCase(s.getAssignmentStatus()))
                .count();

        long activeShipmentsCount = allShipments.stream()
                .filter(s -> s.getStatus() != OrderStatus.DELIVERED && s.getStatus() != OrderStatus.CANCELLED)
                .count();

        long inTransitCount = allShipments.stream()
                .filter(s -> s.getStatus() == OrderStatus.IN_TRANSIT || 
                             s.getStatus() == OrderStatus.PICKED_UP || 
                             s.getStatus() == OrderStatus.OUT_FOR_DELIVERY)
                .count();

        long deliveredCount = allShipments.stream()
                .filter(s -> s.getStatus() == OrderStatus.DELIVERED)
                .count();

        long delayedCount = allShipments.stream()
                .filter(s -> s.getStatus() == OrderStatus.DELAYED || s.getStatus() == OrderStatus.EXCEPTION)
                .count();

        long activeWarehouses = warehouseRepository.countByStatus(WarehouseStatus.ACTIVE);
        long availDrivers = driverRepository.countByStatus(DriverStatus.AVAILABLE);
        long onTripDrivers = driverRepository.countByStatus(DriverStatus.ON_TRIP);
        long availVehicles = vehicleRepository.countByStatus(VehicleStatus.AVAILABLE);
        long inTransitVehicles = vehicleRepository.countByStatus(VehicleStatus.IN_TRANSIT);
        long maintVehicles = vehicleRepository.countByStatus(VehicleStatus.MAINTENANCE);

        List<Inventory> inventories = inventoryRepository.findAll();
        long lowInventoryCount = inventories.stream()
                .filter(i -> i.getAvailableStock() != null && i.getReorderLevel() != null && i.getAvailableStock() <= i.getReorderLevel())
                .count();

        // Build Dynamic Needs Attention List
        List<AdminNeedsAttentionDTO> needsAttnList = new ArrayList<>();

        if (unassignedOrders > 0) {
            needsAttnList.add(new AdminNeedsAttentionDTO(
                    "unassigned_orders",
                    "Orders Awaiting Fulfillment",
                    unassignedOrders,
                    unassignedOrders + " customer order" + (unassignedOrders > 1 ? "s require" : " requires") + " warehouse selection & shipment creation.",
                    "WARNING",
                    "/admin/shipments"
            ));
        }

        if (processingShipments > 0) {
            needsAttnList.add(new AdminNeedsAttentionDTO(
                    "shipments_awaiting_processing",
                    "Shipments Awaiting Warehouse Processing",
                    processingShipments,
                    processingShipments + " consignment" + (processingShipments > 1 ? "s pending" : " pending") + " pick, pack, or fleet assignment at warehouses.",
                    "INFO",
                    "/admin/shipments"
            ));
        }

        if (delayedCount > 0) {
            needsAttnList.add(new AdminNeedsAttentionDTO(
                    "delayed_shipments",
                    "Active Shipment Exceptions",
                    delayedCount,
                    delayedCount + " shipment" + (delayedCount > 1 ? "s flagged" : " flagged") + " with transit delay or exception.",
                    "CRITICAL",
                    "/admin/shipments"
            ));
        }

        if (lowInventoryCount > 0) {
            needsAttnList.add(new AdminNeedsAttentionDTO(
                    "low_inventory",
                    "Low Inventory Warnings",
                    lowInventoryCount,
                    lowInventoryCount + " SKU" + (lowInventoryCount > 1 ? "s have" : " has") + " breached warehouse reorder thresholds.",
                    "WARNING",
                    "/admin/warehouses"
            ));
        }

        if (openTickets > 0) {
            needsAttnList.add(new AdminNeedsAttentionDTO(
                    "open_tickets",
                    "Support Inquiries Pending",
                    openTickets,
                    openTickets + " customer ticket" + (openTickets > 1 ? "s await" : " awaits") + " administrative response.",
                    "INFO",
                    "/admin/support"
            ));
        }

        AdminDashboardSummaryDTO summary = new AdminDashboardSummaryDTO();
        summary.setTotalOrders(totalOrders);
        summary.setTotalShipments(totalShipments);
        summary.setTotalCustomers(totalCustomers);
        summary.setTotalRevenue(totalRevenue);
        summary.setOrdersByStatus(statusMap);
        summary.setRecentOrders(recentOrders);
        summary.setRecentShipments(recentShipments);
        summary.setTopRoutes(topRoutes);
        summary.setTopCustomers(topCustomers);
        summary.setMonthlyStats(monthlyStats);
        summary.setTotalTickets(totalTickets);
        summary.setOpenTickets(openTickets);

        summary.setOrdersAwaitingWarehouseAssignment(unassignedOrders);
        summary.setPendingOrderReview(pendingReview);
        summary.setShipmentsAwaitingProcessing(processingShipments);
        summary.setActiveShipments(activeShipmentsCount);
        summary.setInTransitShipments(inTransitCount);
        summary.setDeliveredShipments(deliveredCount);
        summary.setDelayedShipments(delayedCount);
        summary.setActiveWarehouses(activeWarehouses);
        summary.setAvailableDrivers(availDrivers);
        summary.setDriversOnTrip(onTripDrivers);
        summary.setAvailableVehicles(availVehicles);
        summary.setVehiclesInTransit(inTransitVehicles);
        summary.setVehiclesUnderMaintenance(maintVehicles);
        summary.setLowInventoryAlerts(lowInventoryCount);
        summary.setNeedsAttention(needsAttnList);

        return summary;
    }

    public List<ShipmentTrendPointDTO> getShipmentTrends(int days) {
        if (days <= 0) days = 7;
        if (days > 90) days = 90;

        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(days - 1);
        LocalDateTime startDateTime = startDate.atStartOfDay();

        List<Order> ordersSince = orderRepository.findOrdersSince(startDateTime);

        Map<LocalDate, List<Order>> ordersByDate = ordersSince.stream()
                .collect(Collectors.groupingBy(o -> o.getCreatedAt().toLocalDate()));

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM");
        List<ShipmentTrendPointDTO> points = new ArrayList<>();

        for (int i = 0; i < days; i++) {
            LocalDate date = startDate.plusDays(i);
            String dateLabel = date.format(formatter);

            List<Order> dayOrders = ordersByDate.getOrDefault(date, Collections.emptyList());

            long delivered = dayOrders.stream().filter(o -> o.getStatus() == OrderStatus.DELIVERED).count();
            long inTransit = dayOrders.stream().filter(o -> 
                o.getStatus() == OrderStatus.IN_TRANSIT || 
                o.getStatus() == OrderStatus.PICKED_UP || 
                o.getStatus() == OrderStatus.OUT_FOR_DELIVERY
            ).count();
            long pending = dayOrders.stream().filter(o -> 
                o.getStatus() == OrderStatus.PENDING || 
                o.getStatus() == OrderStatus.CONFIRMED
            ).count();
            long cancelled = dayOrders.stream().filter(o -> o.getStatus() == OrderStatus.CANCELLED).count();
            long total = dayOrders.size();

            points.add(new ShipmentTrendPointDTO(dateLabel, delivered, inTransit, pending, cancelled, total));
        }

        return points;
    }
}
`;
fs.writeFileSync(dashSvcPath, newDashSvcContent, 'utf8');
console.log('Updated AdminDashboardService.java');
