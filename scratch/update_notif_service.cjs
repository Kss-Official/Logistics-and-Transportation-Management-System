const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const javaDir = path.join(BACKEND_ROOT, 'src', 'main', 'java', 'com', 'primeroute', 'logistics');

// 1. Update NotificationService.java
const notifServicePath = path.join(javaDir, 'service', 'NotificationService.java');
const notifServiceCode = `package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.NotificationDTO;
import com.primeroute.logistics.entity.Driver;
import com.primeroute.logistics.entity.Notification;
import com.primeroute.logistics.entity.Role;
import com.primeroute.logistics.entity.SystemSetting;
import com.primeroute.logistics.entity.User;
import com.primeroute.logistics.entity.Warehouse;
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
        return getUserNotifications(user);
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getUserNotifications(User user) {
        if (user == null) {
            return List.of();
        }
        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {
        if (user == null) {
            return 0;
        }
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    @Transactional
    public void markAsRead(Long id, User user) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        if (user != null && !notification.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Unauthorized access to notification id: " + id);
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(User user) {
        if (user != null) {
            notificationRepository.markAllAsReadForUser(user);
        }
    }

    @Transactional
    public void deleteNotification(Long id, User user) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        if (user != null && !notification.getUser().getId().equals(user.getId())) {
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
            case "DISPATCH":
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
            createNotification(admin, title, message, type);
        }
    }

    @Transactional
    public void notifyWarehouseManagers(Warehouse warehouse, String title, String message, String type) {
        if (warehouse == null) {
            return;
        }
        try {
            List<User> warehouseUsers = userRepository.findByWarehouse(warehouse);
            for (User u : warehouseUsers) {
                if (u.getRole() == Role.WAREHOUSE_MANAGER) {
                    createNotification(u, title, message, type);
                }
            }
            if (warehouse.getId() != null) {
                List<User> byIdUsers = userRepository.findByWarehouseId(warehouse.getId());
                for (User u : byIdUsers) {
                    if (u.getRole() == Role.WAREHOUSE_MANAGER) {
                        createNotification(u, title, message, type);
                    }
                }
            }
        } catch (Exception ex) {
            log.warn("Failed to notify warehouse managers for warehouse {}: {}", warehouse.getWarehouseCode(), ex.getMessage());
        }
    }

    @Transactional
    public void notifyDriver(Driver driver, String title, String message, String type) {
        if (driver == null || driver.getEmail() == null) {
            return;
        }
        try {
            userRepository.findByEmailIgnoreCase(driver.getEmail()).ifPresent(user -> {
                createNotification(user, title, message, type);
            });
        } catch (Exception ex) {
            log.warn("Failed to notify driver {}: {}", driver.getEmail(), ex.getMessage());
        }
    }

    @Transactional
    public void notifyDriver(User driverUser, String title, String message, String type) {
        if (driverUser == null) {
            return;
        }
        createNotification(driverUser, title, message, type);
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

fs.writeFileSync(notifServicePath, notifServiceCode, 'utf8');
console.log('Updated NotificationService.java successfully.');
