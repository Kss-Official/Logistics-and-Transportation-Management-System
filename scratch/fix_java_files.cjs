const fs = require('fs');
const path = require('path');

const notifServiceCode = `package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.NotificationDTO;
import com.primeroute.logistics.entity.Notification;
import com.primeroute.logistics.entity.Role;
import com.primeroute.logistics.entity.SystemSetting;
import com.primeroute.logistics.entity.User;
import com.primeroute.logistics.exception.ResourceNotFoundException;
import com.primeroute.logistics.repository.NotificationRepository;
import com.primeroute.logistics.repository.SystemSettingRepository;
import com.primeroute.logistics.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SystemSettingRepository systemSettingRepository;

    @Transactional(readOnly = true)
    public List<NotificationDTO> getCustomerNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    @Transactional
    public void markAsRead(Long id, User user) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Unauthorized access to notification id: " + id);
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(User user) {
        notificationRepository.markAllAsReadForUser(user);
    }

    @Transactional
    public void deleteNotification(Long id, User user) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Unauthorized access to notification id: " + id);
        }
        notificationRepository.delete(notification);
    }

    /**
     * Inspect persisted system settings in PostgreSQL to determine whether a notification of this type is enabled.
     */
    public boolean isNotificationEnabled(String type) {
        if (type == null || type.isBlank()) {
            return true;
        }
        String normalized = type.trim().toUpperCase();
        switch (normalized) {
            case "ORDER":
            case "NEW_ORDER":
                return getBoolSetting("notify_order_updates", true);

            case "SHIPMENT":
            case "SHIPMENT_UPDATE":
                return getBoolSetting("notify_shipment_updates", true);

            case "DELIVERY":
            case "DELIVERY_COMPLETED":
            case "POD":
                return getBoolSetting("notify_delivery_updates", true);

            case "BILLING":
            case "INVOICE":
            case "INVOICE_CREATED":
                return getBoolSetting("notify_invoice", true);

            case "SUPPORT":
            case "SUPPORT_TICKET":
                return getBoolSetting("notify_support_tickets", true);

            case "EMAIL":
                return getBoolSetting("notify_email", true);

            default:
                return true;
        }
    }

    private boolean getBoolSetting(String key, boolean defaultValue) {
        try {
            return systemSettingRepository.findBySettingKey(key)
                    .map(s -> "true".equalsIgnoreCase(s.getSettingValue()))
                    .orElse(defaultValue);
        } catch (Exception ex) {
            log.warn("Unable to read setting {}: {}", key, ex.getMessage());
            return defaultValue;
        }
    }

    @Transactional
    public void createNotification(User user, String title, String message, String type) {
        if (user == null) {
            return;
        }
        if (!isNotificationEnabled(type)) {
            log.info("Notification creation suppressed by preference [{}] for user: {}", type, user.getEmail());
            return;
        }

        // Deduplication against immediate duplicates (5-second window)
        try {
            boolean exists = notificationRepository.existsByUserAndTitleAndTypeAndCreatedAtAfter(
                    user, title, type, LocalDateTime.now().minusSeconds(5)
            );
            if (exists) {
                log.info("Duplicate notification suppressed for user {}: {}", user.getEmail(), title);
                return;
            }
        } catch (Exception ex) {
            log.debug("Deduplication check error: {}", ex.getMessage());
        }

        Notification notification = new Notification(user, title, message, type);
        notificationRepository.save(notification);
    }

    @Transactional
    public void notifyAdmins(String title, String message, String type) {
        if (!isNotificationEnabled(type)) {
            log.info("Admin notification suppressed by preference [{}] for event: {}", type, title);
            return;
        }

        List<User> admins = userRepository.findByRoleOrderByCreatedAtDesc(Role.ADMIN);
        for (User admin : admins) {
            try {
                boolean exists = notificationRepository.existsByUserAndTitleAndTypeAndCreatedAtAfter(
                        admin, title, type, LocalDateTime.now().minusSeconds(5)
                );
                if (exists) {
                    continue;
                }
            } catch (Exception ex) {
                log.debug("Admin deduplication check error: {}", ex.getMessage());
            }

            Notification notification = new Notification(admin, title, message, type);
            notificationRepository.save(notification);
        }
    }

    private NotificationDTO mapToDTO(Notification n) {
        return new NotificationDTO(
                n.getId(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}
`;

const whControllerCode = `package com.primeroute.logistics.controller;

import com.primeroute.logistics.dto.ApiResponse;
import com.primeroute.logistics.dto.NotificationDTO;
import com.primeroute.logistics.dto.warehouse.*;
import com.primeroute.logistics.entity.Driver;
import com.primeroute.logistics.entity.User;
import com.primeroute.logistics.entity.Vehicle;
import com.primeroute.logistics.entity.Warehouse;
import com.primeroute.logistics.exception.ResourceNotFoundException;
import com.primeroute.logistics.repository.UserRepository;
import com.primeroute.logistics.service.NotificationService;
import com.primeroute.logistics.service.WarehouseManagerService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/warehouse-manager", "/api/warehouse"})
public class WarehouseManagerController {

    private final WarehouseManagerService warehouseManagerService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public WarehouseManagerController(
            WarehouseManagerService warehouseManagerService,
            NotificationService notificationService,
            UserRepository userRepository) {
        this.warehouseManagerService = warehouseManagerService;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
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
    public ResponseEntity<ApiResponse<?>> getWarehouse() {
        Object warehouse = warehouseManagerService.getWarehouseDetails();
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
    // INVENTORY
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
    public ResponseEntity<ApiResponse<WarehouseInventoryDTO>> receiveStock(@Valid @RequestBody ReceiveStockRequest request) {
        WarehouseInventoryDTO item = warehouseManagerService.receiveStock(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Stock received and cataloged successfully", item));
    }

    @PostMapping("/inventory/reserve")
    public ResponseEntity<ApiResponse<WarehouseInventoryDTO>> reserveStock(@Valid @RequestBody ReserveStockRequest request) {
        WarehouseInventoryDTO item = warehouseManagerService.reserveStock(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Stock reserved successfully", item));
    }

    @PostMapping("/inventory/adjust")
    public ResponseEntity<ApiResponse<WarehouseInventoryDTO>> adjustStock(@Valid @RequestBody AdjustStockRequest request) {
        WarehouseInventoryDTO item = warehouseManagerService.adjustStock(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Inventory adjusted and audit log created", item));
    }

    @GetMapping("/inventory/transactions")
    public ResponseEntity<ApiResponse<List<WarehouseTransactionDTO>>> getTransactions(
            @RequestParam(required = false) String sku,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<WarehouseTransactionDTO> txs = warehouseManagerService.getTransactions(sku, startDate, endDate);
        return ResponseEntity.ok(new ApiResponse<>(true, "Inventory audit transactions retrieved", txs));
    }

    // ==========================================
    // SHIPMENTS & PICK/PACK/DISPATCH
    // ==========================================

    @GetMapping("/shipments/incoming")
    public ResponseEntity<ApiResponse<List<WarehouseShipmentDTO>>> getIncomingShipments() {
        List<WarehouseShipmentDTO> shipments = warehouseManagerService.getIncomingShipments();
        return ResponseEntity.ok(new ApiResponse<>(true, "Incoming warehouse shipments retrieved", shipments));
    }

    @GetMapping("/shipments/outgoing")
    public ResponseEntity<ApiResponse<List<WarehouseShipmentDTO>>> getOutgoingShipments() {
        List<WarehouseShipmentDTO> shipments = warehouseManagerService.getOutgoingShipments();
        return ResponseEntity.ok(new ApiResponse<>(true, "Outgoing warehouse shipments retrieved", shipments));
    }

    @GetMapping("/shipments/dispatch-ready")
    public ResponseEntity<ApiResponse<List<WarehouseShipmentDTO>>> getDispatchReadyShipments() {
        List<WarehouseShipmentDTO> shipments = warehouseManagerService.getDispatchReadyShipments();
        return ResponseEntity.ok(new ApiResponse<>(true, "Dispatch ready shipments retrieved", shipments));
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

    @PostMapping("/shipments/{id}/start-picking")
    public ResponseEntity<ApiResponse<WarehouseShipmentDTO>> startPicking(@PathVariable Long id) {
        WarehouseShipmentDTO shipment = warehouseManagerService.startPicking(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse picking started successfully", shipment));
    }

    @PostMapping("/shipments/{id}/mark-packed")
    public ResponseEntity<ApiResponse<WarehouseShipmentDTO>> markPacked(@PathVariable Long id) {
        WarehouseShipmentDTO shipment = warehouseManagerService.markPacked(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Shipment marked as packed successfully", shipment));
    }

    @PostMapping("/shipments/{id}/ready-for-dispatch")
    public ResponseEntity<ApiResponse<WarehouseShipmentDTO>> markReadyForDispatch(@PathVariable Long id) {
        WarehouseShipmentDTO shipment = warehouseManagerService.markReadyForDispatch(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Shipment marked as ready for dispatch successfully", shipment));
    }

    @PostMapping({"/shipments/{id}/assign", "/shipments/{id}/assign-fleet"})
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

    @GetMapping("/fleet")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getFleet() {
        List<Map<String, Object>> fleet = warehouseManagerService.getWarehouseFleet();
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse fleet pairs retrieved successfully", fleet));
    }

    @GetMapping("/fleet/available")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAvailableFleet() {
        List<Map<String, Object>> fleet = warehouseManagerService.getAvailableFleet();
        return ResponseEntity.ok(new ApiResponse<>(true, "Available fleet pairs retrieved successfully", fleet));
    }

    @GetMapping("/drivers")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDrivers() {
        List<Map<String, Object>> drivers = warehouseManagerService.getWarehouseDrivers();
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse drivers retrieved successfully", drivers));
    }

    @GetMapping("/drivers/available")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAvailableDrivers() {
        List<Map<String, Object>> drivers = warehouseManagerService.getAvailableDrivers();
        return ResponseEntity.ok(new ApiResponse<>(true, "Available drivers retrieved successfully", drivers));
    }

    @GetMapping("/vehicles")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getVehicles() {
        List<Map<String, Object>> vehicles = warehouseManagerService.getWarehouseVehicles();
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse vehicles retrieved successfully", vehicles));
    }

    @GetMapping("/vehicles/available")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAvailableVehicles() {
        List<Map<String, Object>> vehicles = warehouseManagerService.getAvailableVehicles();
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
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getNotifications(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authentication.getName()));

        List<NotificationDTO> list = notificationService.getUserNotifications(user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse notifications retrieved successfully", list));
    }

    @GetMapping("/notifications/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authentication.getName()));

        long count = notificationService.getUnreadCount(user);
        Map<String, Long> res = new HashMap<>();
        res.put("unreadCount", count);
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse unread count retrieved successfully", res));
    }

    @PatchMapping("/notifications/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable String id,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authentication.getName()));

        Long numericId;
        try {
            numericId = Long.parseLong(id);
        } catch (NumberFormatException e) {
            throw new ResourceNotFoundException("Notification not found with id: " + id);
        }

        notificationService.markAsRead(numericId, user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse notification marked as read", null));
    }

    @PatchMapping("/notifications/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authentication.getName()));

        notificationService.markAllAsRead(user);
        return ResponseEntity.ok(new ApiResponse<>(true, "All warehouse notifications marked as read", null));
    }

    @DeleteMapping("/notifications/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @PathVariable String id,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authentication.getName()));

        Long numericId;
        try {
            numericId = Long.parseLong(id);
        } catch (NumberFormatException e) {
            throw new ResourceNotFoundException("Notification not found with id: " + id);
        }

        notificationService.deleteNotification(numericId, user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse notification deleted successfully", null));
    }

    // ==========================================
    // MY ORDERS (ORIGIN WAREHOUSE SCOPED)
    // ==========================================

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<WarehouseOrderDTO>>> getWarehouseOrders(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String deliveryType) {
        List<WarehouseOrderDTO> orders = warehouseManagerService.getWarehouseOrders(search, status, deliveryType);
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse orders retrieved successfully", orders));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<WarehouseOrderDTO>> getWarehouseOrderById(@PathVariable Long id) {
        WarehouseOrderDTO order = warehouseManagerService.getWarehouseOrderById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse order retrieved successfully", order));
    }

    @PostMapping("/orders/{id}/start-processing")
    public ResponseEntity<ApiResponse<WarehouseOrderDTO>> startOrderProcessing(@PathVariable Long id) {
        WarehouseOrderDTO order = warehouseManagerService.startOrderProcessing(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Order processing (picking) started successfully", order));
    }

    @PostMapping("/orders/{id}/mark-packed")
    public ResponseEntity<ApiResponse<WarehouseOrderDTO>> markOrderPacked(@PathVariable Long id) {
        WarehouseOrderDTO order = warehouseManagerService.markOrderPacked(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Order marked as packed successfully", order));
    }

    @PostMapping("/orders/{id}/ready-for-dispatch")
    public ResponseEntity<ApiResponse<WarehouseOrderDTO>> markOrderReadyForDispatch(@PathVariable Long id) {
        WarehouseOrderDTO order = warehouseManagerService.markOrderReadyForDispatch(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Order staged and ready for dispatch", order));
    }

}
`;

const baseBackend = "C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics";
fs.writeFileSync(path.join(baseBackend, "service/NotificationService.java"), notifServiceCode, 'utf8');
fs.writeFileSync(path.join(baseBackend, "controller/WarehouseManagerController.java"), whControllerCode, 'utf8');
console.log('Successfully written updated Java files');
