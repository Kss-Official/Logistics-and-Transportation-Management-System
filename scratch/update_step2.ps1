$userRepoPath = "C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management\src\main\java\com\primeroute\logistics\repository\UserRepository.java"
$adminWarehouseServicePath = "C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management\src\main\java\com\primeroute\logistics\service\AdminWarehouseService.java"

$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)

# 1. Update UserRepository.java
$userRepoCode = @'
package com.primeroute.logistics.repository;

import com.primeroute.logistics.entity.Role;
import com.primeroute.logistics.entity.User;
import com.primeroute.logistics.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailIgnoreCase(String email);

    long countByRole(Role role);

    List<User> findByRoleOrderByCreatedAtDesc(Role role);

    Optional<User> findByIdAndRole(Long id, Role role);

    List<User> findByWarehouse(Warehouse warehouse);

    List<User> findByWarehouseId(Long warehouseId);
}
'@

[System.IO.File]::WriteAllText($userRepoPath, $userRepoCode, $utf8WithoutBom)
Write-Host "Updated UserRepository.java successfully." -ForegroundColor Green

# 2. Update AdminWarehouseService.java
$adminServiceCode = @'
package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.*;
import com.primeroute.logistics.entity.*;
import com.primeroute.logistics.exception.ResourceNotFoundException;
import com.primeroute.logistics.repository.RouteRepository;
import com.primeroute.logistics.repository.ShipmentRepository;
import com.primeroute.logistics.repository.UserRepository;
import com.primeroute.logistics.repository.WarehouseRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AdminWarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final ShipmentRepository shipmentRepository;
    private final RouteRepository routeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminWarehouseService(
            WarehouseRepository warehouseRepository,
            ShipmentRepository shipmentRepository,
            RouteRepository routeRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.warehouseRepository = warehouseRepository;
        this.shipmentRepository = shipmentRepository;
        this.routeRepository = routeRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<WarehouseDTO> getAllWarehouses() {
        List<Warehouse> warehouses = warehouseRepository.findAllByOrderByCreatedAtDesc();
        List<Shipment> allShipments = shipmentRepository.findAll();
        List<Route> allRoutes = routeRepository.findAll();

        List<WarehouseDTO> dtoList = new ArrayList<>();
        for (Warehouse w : warehouses) {
            dtoList.add(convertToDTO(w, allShipments, allRoutes));
        }
        return dtoList;
    }

    @Transactional(readOnly = true)
    public WarehouseDTO getWarehouseById(Long id) {
        Warehouse w = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + id));
        List<Shipment> allShipments = shipmentRepository.findAll();
        List<Route> allRoutes = routeRepository.findAll();
        return convertToDTO(w, allShipments, allRoutes);
    }

    @Transactional
    public WarehouseDTO createWarehouse(CreateWarehouseRequest req) {
        String cleanCode = req.getWarehouseCode().trim().toUpperCase();
        if (warehouseRepository.existsByWarehouseCodeIgnoreCase(cleanCode)) {
            throw new IllegalArgumentException("Warehouse code '" + cleanCode + "' is already in use.");
        }

        if (req.getOccupiedCapacity() != null && req.getOccupiedCapacity() > req.getTotalCapacity()) {
            throw new IllegalArgumentException("Occupied capacity cannot exceed total capacity.");
        }

        String cleanManagerEmail = req.getManagerEmail() != null ? req.getManagerEmail().trim().toLowerCase() : null;
        if (cleanManagerEmail != null && !cleanManagerEmail.isBlank()) {
            validateManagerEmailRole(cleanManagerEmail);
        }

        Warehouse w = new Warehouse();
        w.setWarehouseCode(cleanCode);
        w.setWarehouseName(req.getWarehouseName().trim());
        w.setWarehouseType(req.getWarehouseType() != null ? req.getWarehouseType() : WarehouseType.DISTRIBUTION_CENTER);
        w.setStatus(req.getStatus() != null ? req.getStatus() : WarehouseStatus.ACTIVE);
        w.setManagerName(req.getManagerName().trim());
        w.setManagerPhone(req.getManagerPhone() != null ? req.getManagerPhone().trim() : null);
        w.setManagerEmail(cleanManagerEmail);
        w.setAddressLine1(req.getAddressLine1().trim());
        w.setAddressLine2(req.getAddressLine2() != null ? req.getAddressLine2().trim() : null);
        w.setCity(req.getCity().trim());
        w.setState(req.getState().trim());
        w.setPostalCode(req.getPostalCode().trim());
        w.setCountry(req.getCountry() != null ? req.getCountry().trim() : "India");
        w.setLatitude(req.getLatitude());
        w.setLongitude(req.getLongitude());
        w.setTotalCapacity(req.getTotalCapacity());
        w.setOccupiedCapacity(req.getOccupiedCapacity() != null ? req.getOccupiedCapacity() : 0.0);
        w.setCapacityUnit(req.getCapacityUnit() != null && !req.getCapacityUnit().isBlank() ? req.getCapacityUnit().trim().toUpperCase() : "KG");
        w.setOperatingHours(req.getOperatingHours() != null ? req.getOperatingHours().trim() : "Mon-Sat, 06:00 AM - 10:00 PM");
        w.setContactPhone(req.getContactPhone() != null ? req.getContactPhone().trim() : null);
        w.setContactEmail(req.getContactEmail() != null ? req.getContactEmail().trim() : null);

        Warehouse saved = warehouseRepository.save(w);

        if (cleanManagerEmail != null && !cleanManagerEmail.isBlank()) {
            syncWarehouseManager(saved, cleanManagerEmail, req.getManagerName(), req.getManagerPhone());
        }

        return convertToDTO(saved, List.of(), List.of());
    }

    @Transactional
    public WarehouseDTO updateWarehouse(Long id, UpdateWarehouseRequest req) {
        Warehouse w = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + id));

        String cleanCode = req.getWarehouseCode().trim().toUpperCase();
        if (!w.getWarehouseCode().equalsIgnoreCase(cleanCode)) {
            if (warehouseRepository.existsByWarehouseCodeIgnoreCaseAndIdNot(cleanCode, id)) {
                throw new IllegalArgumentException("Warehouse code '" + cleanCode + "' is already in use.");
            }
            w.setWarehouseCode(cleanCode);
        }

        if (req.getOccupiedCapacity() != null && req.getOccupiedCapacity() > req.getTotalCapacity()) {
            throw new IllegalArgumentException("Occupied capacity cannot exceed total capacity.");
        }

        String oldManagerEmail = w.getManagerEmail() != null ? w.getManagerEmail().trim().toLowerCase() : "";
        String newManagerEmail = req.getManagerEmail() != null ? req.getManagerEmail().trim().toLowerCase() : "";
        String newManagerName = req.getManagerName() != null ? req.getManagerName().trim() : "";
        String newManagerPhone = req.getManagerPhone() != null ? req.getManagerPhone().trim() : null;

        // If manager email changed or provided, validate role before updating
        if (!newManagerEmail.isBlank() && !newManagerEmail.equalsIgnoreCase(oldManagerEmail)) {
            validateManagerEmailRole(newManagerEmail);
        }

        w.setWarehouseName(req.getWarehouseName().trim());
        w.setWarehouseType(req.getWarehouseType());
        if (req.getStatus() != null) {
            w.setStatus(req.getStatus());
        }
        w.setManagerName(newManagerName);
        w.setManagerPhone(newManagerPhone);
        w.setManagerEmail(!newManagerEmail.isBlank() ? newManagerEmail : null);
        w.setAddressLine1(req.getAddressLine1().trim());
        w.setAddressLine2(req.getAddressLine2() != null ? req.getAddressLine2().trim() : null);
        w.setCity(req.getCity().trim());
        w.setState(req.getState().trim());
        w.setPostalCode(req.getPostalCode().trim());
        w.setCountry(req.getCountry() != null ? req.getCountry().trim() : "India");
        w.setLatitude(req.getLatitude());
        w.setLongitude(req.getLongitude());
        w.setTotalCapacity(req.getTotalCapacity());
        if (req.getOccupiedCapacity() != null) {
            w.setOccupiedCapacity(req.getOccupiedCapacity());
        }
        if (req.getCapacityUnit() != null && !req.getCapacityUnit().isBlank()) {
            w.setCapacityUnit(req.getCapacityUnit().trim().toUpperCase());
        }
        if (req.getOperatingHours() != null) {
            w.setOperatingHours(req.getOperatingHours().trim());
        }
        w.setContactPhone(req.getContactPhone() != null ? req.getContactPhone().trim() : null);
        w.setContactEmail(req.getContactEmail() != null ? req.getContactEmail().trim() : null);

        Warehouse saved = warehouseRepository.save(w);

        // Manager synchronization
        if (!newManagerEmail.isBlank()) {
            if (!oldManagerEmail.isBlank() && !newManagerEmail.equalsIgnoreCase(oldManagerEmail)) {
                // Email changed: unassign old manager from this warehouse
                userRepository.findByEmailIgnoreCase(oldManagerEmail).ifPresent(oldUser -> {
                    if (oldUser.getWarehouse() != null && oldUser.getWarehouse().getId().equals(saved.getId())) {
                        oldUser.setWarehouse(null);
                        userRepository.save(oldUser);
                    }
                });
            }
            // Assign / update new manager
            syncWarehouseManager(saved, newManagerEmail, newManagerName, newManagerPhone);
        } else if (!oldManagerEmail.isBlank()) {
            // Manager email cleared: unassign old manager
            userRepository.findByEmailIgnoreCase(oldManagerEmail).ifPresent(oldUser -> {
                if (oldUser.getWarehouse() != null && oldUser.getWarehouse().getId().equals(saved.getId())) {
                    oldUser.setWarehouse(null);
                    userRepository.save(oldUser);
                }
            });
        }

        List<Shipment> allShipments = shipmentRepository.findAll();
        List<Route> allRoutes = routeRepository.findAll();
        return convertToDTO(saved, allShipments, allRoutes);
    }

    private void validateManagerEmailRole(String email) {
        if (email == null || email.isBlank()) {
            return;
        }
        String cleanEmail = email.trim().toLowerCase();
        Optional<User> existingUserOpt = userRepository.findByEmailIgnoreCase(cleanEmail)
                .or(() -> userRepository.findByEmail(cleanEmail));

        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            if (existingUser.getRole() == Role.ADMIN) {
                throw new IllegalArgumentException("The email '" + cleanEmail + "' is associated with an Administrator account and cannot be assigned as a Warehouse Manager.");
            }
            if (existingUser.getRole() == Role.CUSTOMER) {
                throw new IllegalArgumentException("The email '" + cleanEmail + "' is already registered as a Customer. Cannot assign as Warehouse Manager.");
            }
            if (existingUser.getRole() == Role.DRIVER) {
                throw new IllegalArgumentException("The email '" + cleanEmail + "' is already registered as a Driver. Cannot assign as Warehouse Manager.");
            }
            if (existingUser.getRole() != Role.WAREHOUSE_MANAGER) {
                throw new IllegalArgumentException("The email '" + cleanEmail + "' is already associated with role '" + existingUser.getRole() + "'. Cannot assign as Warehouse Manager.");
            }
        }
    }

    private void syncWarehouseManager(Warehouse warehouse, String managerEmail, String managerName, String managerPhone) {
        if (managerEmail == null || managerEmail.isBlank()) {
            return;
        }
        String cleanEmail = managerEmail.trim().toLowerCase();
        String cleanName = (managerName != null && !managerName.isBlank()) ? managerName.trim() : "Warehouse Manager";
        String cleanPhone = (managerPhone != null && !managerPhone.isBlank()) ? managerPhone.trim() : null;

        Optional<User> existingUserOpt = userRepository.findByEmailIgnoreCase(cleanEmail)
                .or(() -> userRepository.findByEmail(cleanEmail));

        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            if (existingUser.getRole() == Role.ADMIN) {
                throw new IllegalArgumentException("The email '" + cleanEmail + "' is associated with an Administrator account and cannot be assigned as a Warehouse Manager.");
            }
            if (existingUser.getRole() != Role.WAREHOUSE_MANAGER) {
                throw new IllegalArgumentException("The email '" + cleanEmail + "' is already registered with role '" + existingUser.getRole() + "'. Cannot assign as Warehouse Manager.");
            }

            // Unassign any other manager currently assigned to this warehouse (except this user)
            List<User> assignedManagers = userRepository.findByWarehouse(warehouse);
            for (User u : assignedManagers) {
                if (!u.getId().equals(existingUser.getId())) {
                    u.setWarehouse(null);
                    userRepository.save(u);
                }
            }

            // Reuse existing user - DO NOT reset or overwrite password!
            existingUser.setWarehouse(warehouse);
            existingUser.setFullName(cleanName);
            if (cleanPhone != null) {
                existingUser.setPhone(cleanPhone);
            }
            existingUser.setStatus("ACTIVE");
            userRepository.save(existingUser);
        } else {
            // Unassign any current manager user from this warehouse
            List<User> assignedManagers = userRepository.findByWarehouse(warehouse);
            for (User u : assignedManagers) {
                u.setWarehouse(null);
                userRepository.save(u);
            }

            // Create new WAREHOUSE_MANAGER user with default development password
            User newManager = new User(
                    cleanEmail,
                    passwordEncoder.encode("Manager@2026!"),
                    cleanName,
                    Role.WAREHOUSE_MANAGER
            );
            if (cleanPhone != null) {
                newManager.setPhone(cleanPhone);
            }
            newManager.setWarehouse(warehouse);
            newManager.setStatus("ACTIVE");
            userRepository.save(newManager);
        }
    }

    @Transactional
    public WarehouseDTO updateStatus(Long id, UpdateWarehouseStatusRequest req) {
        Warehouse w = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + id));

        WarehouseStatus target = req.getStatus();
        if (target == WarehouseStatus.INACTIVE || target == WarehouseStatus.MAINTENANCE) {
            long activeShipments = countActiveShipmentsForCity(w.getCity());
            if (activeShipments > 0) {
                throw new IllegalArgumentException("Cannot set warehouse to " + target + " while " + activeShipments + " active shipment(s) are operating through this location.");
            }
        }

        w.setStatus(target);
        Warehouse saved = warehouseRepository.save(w);
        List<Shipment> allShipments = shipmentRepository.findAll();
        List<Route> allRoutes = routeRepository.findAll();
        return convertToDTO(saved, allShipments, allRoutes);
    }

    @Transactional
    public void deactivateWarehouse(Long id) {
        Warehouse w = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + id));

        long activeShipments = countActiveShipmentsForCity(w.getCity());
        if (activeShipments > 0) {
            throw new IllegalArgumentException("This warehouse currently has active operational assignments (" + activeShipments + " active loads). Complete or reassign these operations before deactivating the warehouse.");
        }

        w.setStatus(WarehouseStatus.INACTIVE);
        warehouseRepository.save(w);
    }

    @Transactional
    public void deleteWarehouse(Long id) {
        Warehouse w = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + id));

        long activeShipments = countActiveShipmentsForCity(w.getCity());
        if (activeShipments > 0) {
            throw new IllegalArgumentException("This warehouse currently has active operational assignments (" + activeShipments + " active loads). Complete or reassign these operations before removing the warehouse.");
        }

        warehouseRepository.delete(w);
    }

    private long countActiveShipmentsForCity(String city) {
        if (city == null || city.isBlank()) return 0;
        String cleanCity = city.trim().toLowerCase();
        List<Shipment> all = shipmentRepository.findAll();
        return all.stream().filter(s -> {
            boolean isActive = s.getStatus() != OrderStatus.DELIVERED && s.getStatus() != OrderStatus.CANCELLED;
            if (!isActive || s.getOrder() == null) return false;
            boolean matchesOrigin = s.getOrder().getPickupAddress() != null &&
                    cleanCity.equalsIgnoreCase(s.getOrder().getPickupAddress().getCity());
            boolean matchesDest = s.getOrder().getDeliveryAddress() != null &&
                    cleanCity.equalsIgnoreCase(s.getOrder().getDeliveryAddress().getCity());
            return matchesOrigin || matchesDest;
        }).count();
    }

    private WarehouseDTO convertToDTO(Warehouse w, List<Shipment> allShipments, List<Route> allRoutes) {
        WarehouseDTO dto = new WarehouseDTO();
        dto.setId(w.getId());
        dto.setWarehouseCode(w.getWarehouseCode());
        dto.setWarehouseName(w.getWarehouseName());
        dto.setWarehouseType(w.getWarehouseType());
        dto.setStatus(w.getStatus());
        dto.setManagerName(w.getManagerName());
        dto.setManagerPhone(w.getManagerPhone() != null ? w.getManagerPhone() : "");
        dto.setManagerEmail(w.getManagerEmail() != null ? w.getManagerEmail() : "");
        dto.setAddressLine1(w.getAddressLine1());
        dto.setAddressLine2(w.getAddressLine2() != null ? w.getAddressLine2() : "");
        dto.setCity(w.getCity());
        dto.setState(w.getState());
        dto.setPostalCode(w.getPostalCode());
        dto.setCountry(w.getCountry());
        dto.setLatitude(w.getLatitude());
        dto.setLongitude(w.getLongitude());
        dto.setTotalCapacity(w.getTotalCapacity());
        dto.setOccupiedCapacity(w.getOccupiedCapacity());

        double total = w.getTotalCapacity() != null ? w.getTotalCapacity() : 0.0;
        double occ = w.getOccupiedCapacity() != null ? w.getOccupiedCapacity() : 0.0;
        double avail = Math.max(0.0, total - occ);
        double rate = total > 0 ? (occ / total) * 100.0 : 0.0;

        dto.setAvailableCapacity(avail);
        dto.setUtilizationRate(Math.round(rate * 10.0) / 10.0);
        dto.setCapacityUnit(w.getCapacityUnit() != null ? w.getCapacityUnit() : "KG");
        dto.setOperatingHours(w.getOperatingHours() != null ? w.getOperatingHours() : "Mon-Sat, 06:00 AM - 10:00 PM");
        dto.setContactPhone(w.getContactPhone() != null ? w.getContactPhone() : "");
        dto.setContactEmail(w.getContactEmail() != null ? w.getContactEmail() : "");
        dto.setCreatedAt(w.getCreatedAt());
        dto.setUpdatedAt(w.getUpdatedAt());

        // Operational metrics
        String cleanCity = w.getCity() != null ? w.getCity().trim().toLowerCase() : "";
        long inbound = 0;
        long outbound = 0;
        long activeTotal = 0;

        for (Shipment s : allShipments) {
            boolean isActive = s.getStatus() != OrderStatus.DELIVERED && s.getStatus() != OrderStatus.CANCELLED;
            if (isActive && s.getOrder() != null) {
                boolean isDest = s.getOrder().getDeliveryAddress() != null &&
                        cleanCity.equalsIgnoreCase(s.getOrder().getDeliveryAddress().getCity());
                boolean isOrigin = s.getOrder().getPickupAddress() != null &&
                        cleanCity.equalsIgnoreCase(s.getOrder().getPickupAddress().getCity());

                if (isDest) inbound++;
                if (isOrigin) outbound++;
                if (isDest || isOrigin) activeTotal++;
            }
        }

        long activeRoutes = 0;
        for (Route r : allRoutes) {
            if (r.getStatus() == RouteStatus.ACTIVE) {
                boolean matchesOrigin = cleanCity.equalsIgnoreCase(r.getOriginCity());
                boolean matchesDest = cleanCity.equalsIgnoreCase(r.getDestinationCity());
                if (matchesOrigin || matchesDest) {
                    activeRoutes++;
                }
            }
        }

        dto.setInboundLoadCount(inbound);
        dto.setOutboundLoadCount(outbound);
        dto.setActiveShipmentCount(activeTotal);
        dto.setActiveRouteCount(activeRoutes);

        return dto;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedDefaultWarehouses() {
        if (warehouseRepository.count() > 0) {
            return;
        }

        List<Warehouse> defaultList = List.of(
            createSeedWarehouse("WH-BLR-001", "Bengaluru Central Hub", WarehouseType.DISTRIBUTION_CENTER,
                "Priya Sharma", "+91 98001 11001", "priya@primeroute.com",
                "Plot 42, Export Promotion Industrial Park, Whitefield", "Phase 2 Industrial Corridor",
                "Bengaluru", "Karnataka", "560066", 12.9716, 77.5946,
                10000.0, 6800.0, "KG", "Mon-Sat, 06:00 AM - 10:00 PM", "+91 80 4455 6601", "support.blr@primeroute.com"),

            createSeedWarehouse("WH-MUM-002", "Mumbai West Freight Center", WarehouseType.CROSS_DOCK,
                "R. Deshpande", "+91 98001 22002", "mum.west@primeroute.com",
                "Bldg 12, MIDC Logistics Park, Andheri East", "Near International Air Cargo Terminal",
                "Mumbai", "Maharashtra", "400093", 19.0760, 72.8777,
                8000.0, 7400.0, "KG", "24/7 Operations", "+91 22 6677 8802", "support.mum@primeroute.com"),

            createSeedWarehouse("WH-DEL-003", "Delhi NCR Mega Fulfillment", WarehouseType.FULFILLMENT_CENTER,
                "N. Kapoor", "+91 98001 33003", "del.ncr@primeroute.com",
                "Sector 37, Pace City II, Udyog Vihar", "NH-48 Corridor",
                "Gurugram", "Haryana", "122001", 28.4595, 77.0266,
                15000.0, 11200.0, "KG", "24/7 Operations", "+91 124 4567 803", "support.del@primeroute.com"),

            createSeedWarehouse("WH-CHE-004", "Chennai Port Yard & Cold Storage", WarehouseType.COLD_STORAGE,
                "V. Ilango", "+91 98001 44004", "che.port@primeroute.com",
                "Harbour Expressway, Ennore Port Zone", "Gate 4 Container Terminal",
                "Chennai", "Tamil Nadu", "600057", 13.0827, 80.2707,
                6500.0, 2200.0, "KG", "Mon-Fri, 08:00 AM - 06:00 PM", "+91 44 2833 4404", "support.che@primeroute.com"),

            createSeedWarehouse("WH-HYD-005", "Hyderabad Aerotropolis Hub", WarehouseType.TRANSIT_HUB,
                "A. Reddy", "+91 98001 55005", "hyd.central@primeroute.com",
                "GMR Logistics Park, Shamshabad Airport Road", "Cargo Village Bay 7",
                "Hyderabad", "Telangana", "500409", 17.3850, 78.4867,
                9000.0, 4800.0, "KG", "Mon-Sat, 07:00 AM - 11:00 PM", "+91 40 2345 6705", "support.hyd@primeroute.com"),

            createSeedWarehouse("WH-CCU-006", "Kolkata Eastern Corridor Hub", WarehouseType.STORAGE_WAREHOUSE,
                "P. Mukherjee", "+91 98001 66006", "ccu.east@primeroute.com",
                "Dankuni Industrial Estate, NH-19 Toll Plaza", "Plot 18, Block B",
                "Kolkata", "West Bengal", "712311", 22.5726, 88.3639,
                7500.0, 3100.0, "KG", "Mon-Sat, 06:00 AM - 09:00 PM", "+91 33 2211 4406", "support.ccu@primeroute.com")
        );

        warehouseRepository.saveAll(defaultList);
    }

    private Warehouse createSeedWarehouse(
            String code, String name, WarehouseType type,
            String managerName, String managerPhone, String managerEmail,
            String addr1, String addr2, String city, String state, String postal,
            Double lat, Double lng, Double totalCap, Double occCap, String capUnit,
            String hours, String contactPhone, String contactEmail) {

        Warehouse w = new Warehouse();
        w.setWarehouseCode(code);
        w.setWarehouseName(name);
        w.setWarehouseType(type);
        w.setStatus(WarehouseStatus.ACTIVE);
        w.setManagerName(managerName);
        w.setManagerPhone(managerPhone);
        w.setManagerEmail(managerEmail);
        w.setAddressLine1(addr1);
        w.setAddressLine2(addr2);
        w.setCity(city);
        w.setState(state);
        w.setPostalCode(postal);
        w.setCountry("India");
        w.setLatitude(lat);
        w.setLongitude(lng);
        w.setTotalCapacity(totalCap);
        w.setOccupiedCapacity(occCap);
        w.setCapacityUnit(capUnit);
        w.setOperatingHours(hours);
        w.setContactPhone(contactPhone);
        w.setContactEmail(contactEmail);

        return w;
    }
}
'@

[System.IO.File]::WriteAllText($adminWarehouseServicePath, $adminServiceCode, $utf8WithoutBom)
Write-Host "Updated AdminWarehouseService.java successfully." -ForegroundColor Green
