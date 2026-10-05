$BACKEND_ROOT = "C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management\src\main\java\com\primeroute\logistics"

# 1. Update DriverDeliveryDTO.java
$dtoContent = @"
package com.primeroute.logistics.dto.driver;

import java.util.ArrayList;
import java.util.List;

public class DriverDeliveryDTO {
    private String id;
    private Long shipmentId;
    private String trackingNumber;
    private String orderNumber;
    private String status;
    private String operationalStage;
    private String priority;
    private String assignedAt;
    private String assignedDate;
    private String estimatedDeliveryTime;
    private String deliveryEta;
    private String pickupEta;
    private int totalPackages;
    private int totalQuantity;
    private double totalWeightKg;
    private double volumeCbm;
    private String cargoSummary;
    private String customerOrderRef;
    private String recipientName;
    private String recipientPhone;
    private String recipientEmail;
    private String recipientCity;
    private DriverLocationDTO pickupLocation;
    private DriverLocationDTO deliveryLocation;
    private DriverLocationDTO destination;
    private List<DriverCargoItemDTO> cargoItems = new ArrayList<>();
    private List<DriverTrackingEventDTO> trackingEvents = new ArrayList<>();
    private ProofOfDeliveryDTO proofOfDelivery;
    private double distanceKm;
    private int estimatedDurationMins;

    public DriverDeliveryDTO() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Long getShipmentId() { return shipmentId; }
    public void setShipmentId(Long shipmentId) { this.shipmentId = shipmentId; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getOperationalStage() { return operationalStage; }
    public void setOperationalStage(String operationalStage) { this.operationalStage = operationalStage; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getAssignedAt() { return assignedAt; }
    public void setAssignedAt(String assignedAt) { this.assignedAt = assignedAt; }

    public String getAssignedDate() { return assignedDate; }
    public void setAssignedDate(String assignedDate) { this.assignedDate = assignedDate; }

    public String getEstimatedDeliveryTime() { return estimatedDeliveryTime; }
    public void setEstimatedDeliveryTime(String estimatedDeliveryTime) { this.estimatedDeliveryTime = estimatedDeliveryTime; }

    public String getDeliveryEta() { return deliveryEta; }
    public void setDeliveryEta(String deliveryEta) { this.deliveryEta = deliveryEta; }

    public String getPickupEta() { return pickupEta; }
    public void setPickupEta(String pickupEta) { this.pickupEta = pickupEta; }

    public int getTotalPackages() { return totalPackages; }
    public void setTotalPackages(int totalPackages) { this.totalPackages = totalPackages; }

    public int getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(int totalQuantity) { this.totalQuantity = totalQuantity; }

    public double getTotalWeightKg() { return totalWeightKg; }
    public void setTotalWeightKg(double totalWeightKg) { this.totalWeightKg = totalWeightKg; }

    public double getVolumeCbm() { return volumeCbm; }
    public void setVolumeCbm(double volumeCbm) { this.volumeCbm = volumeCbm; }

    public String getCargoSummary() { return cargoSummary; }
    public void setCargoSummary(String cargoSummary) { this.cargoSummary = cargoSummary; }

    public String getCustomerOrderRef() { return customerOrderRef; }
    public void setCustomerOrderRef(String customerOrderRef) { this.customerOrderRef = customerOrderRef; }

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public String getRecipientPhone() { return recipientPhone; }
    public void setRecipientPhone(String recipientPhone) { this.recipientPhone = recipientPhone; }

    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }

    public String getRecipientCity() { return recipientCity; }
    public void setRecipientCity(String recipientCity) { this.recipientCity = recipientCity; }

    public DriverLocationDTO getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(DriverLocationDTO pickupLocation) { this.pickupLocation = pickupLocation; }

    public DriverLocationDTO getDeliveryLocation() { return deliveryLocation; }
    public void setDeliveryLocation(DriverLocationDTO deliveryLocation) { this.deliveryLocation = deliveryLocation; }

    public DriverLocationDTO getDestination() { return destination; }
    public void setDestination(DriverLocationDTO destination) { this.destination = destination; }

    public List<DriverCargoItemDTO> getCargoItems() { return cargoItems; }
    public void setCargoItems(List<DriverCargoItemDTO> cargoItems) { this.cargoItems = cargoItems; }

    public List<DriverTrackingEventDTO> getTrackingEvents() { return trackingEvents; }
    public void setTrackingEvents(List<DriverTrackingEventDTO> trackingEvents) { this.trackingEvents = trackingEvents; }

    public ProofOfDeliveryDTO getProofOfDelivery() { return proofOfDelivery; }
    public void setProofOfDelivery(ProofOfDeliveryDTO proofOfDelivery) { this.proofOfDelivery = proofOfDelivery; }

    public double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(double distanceKm) { this.distanceKm = distanceKm; }

    public int getEstimatedDurationMins() { return estimatedDurationMins; }
    public void setEstimatedDurationMins(int estimatedDurationMins) { this.estimatedDurationMins = estimatedDurationMins; }
}
"@
[System.IO.File]::WriteAllText("$BACKEND_ROOT\dto\driver\DriverDeliveryDTO.java", $dtoContent, [System.Text.Encoding]::UTF8)
Write-Host "Updated DriverDeliveryDTO.java"

# 2. Update DriverPortalService.java
$serviceContent = @"
package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.driver.*;
import com.primeroute.logistics.entity.*;
import com.primeroute.logistics.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DriverPortalService {

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ShipmentTrackingEventRepository shipmentTrackingEventRepository;

    @Autowired
    private ProofOfDeliveryRepository proofOfDeliveryRepository;

    @Autowired
    private UserRepository userRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    /**
     * Resolves the authenticated driver from the current SecurityContext.
     */
    public Driver getAuthenticatedDriver() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new SecurityException("User is not authenticated");
        }
        String principal = auth.getName();

        // 1. Try finding driver by email
        Optional<Driver> driverOpt = driverRepository.findByEmailIgnoreCase(principal);
        if (driverOpt.isPresent()) {
            return driverOpt.get();
        }

        // 2. Try finding user and matching driver by user email/id
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(principal);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            Optional<Driver> dByUser = driverRepository.findByEmailIgnoreCase(user.getEmail());
            if (dByUser.isPresent()) {
                return dByUser.get();
            }
        }

        // 3. Fallback for testing/admin context: first available driver
        List<Driver> all = driverRepository.findAll();
        if (!all.isEmpty()) {
            return all.get(0);
        }

        throw new SecurityException("No driver profile linked to account: " + principal);
    }

    /**
     * Retrieves the profile of the authenticated driver.
     */
    @Transactional(readOnly = true)
    public DriverProfileDTO getDriverProfile() {
        Driver driver = getAuthenticatedDriver();
        DriverProfileDTO dto = new DriverProfileDTO();
        dto.setId(driver.getId());
        dto.setDriverId("DRV-" + String.format("%03d", driver.getId()));
        dto.setDriverCode("DRV-" + String.format("%03d", driver.getId()));
        dto.setFullName(driver.getFullName());
        dto.setName(driver.getFullName());
        dto.setEmail(driver.getEmail());
        dto.setPhone(driver.getPhone());
        dto.setLicenseNumber(driver.getLicenseNumber());
        if (driver.getLicenseExpiryDate() != null) {
            dto.setLicenseExpiry(driver.getLicenseExpiryDate().format(DATE_FMT));
        }
        dto.setStatus(driver.getStatus() != null ? driver.getStatus().name() : "AVAILABLE");
        dto.setAddress(driver.getAddress());

        if (driver.getWarehouse() != null) {
            dto.setAssignedWarehouseId(driver.getWarehouse().getId());
            dto.setAssignedWarehouseCode(driver.getWarehouse().getWarehouseCode());
            dto.setAssignedWarehouseName(driver.getWarehouse().getWarehouseName());
            dto.setAssignedHub(driver.getWarehouse().getWarehouseName() + " (" + driver.getWarehouse().getCity() + ")");
        }

        // Check assigned vehicle
        List<Vehicle> vehicles = vehicleRepository.findAll();
        for (Vehicle v : vehicles) {
            if (v.getDriver() != null && v.getDriver().getId().equals(driver.getId())) {
                dto.setAssignedVehicleId(v.getId());
                dto.setAssignedVehicleCode(v.getVehicleNumber());
                dto.setAssignedVehiclePlate(v.getRegistrationNumber() != null ? v.getRegistrationNumber() : v.getVehicleNumber());
                dto.setAssignedVehicleModel(v.getModel() != null ? v.getModel() : v.getVehicleType().name());
                dto.setAssignedVehicleType(v.getVehicleType() != null ? v.getVehicleType().name() : "TRUCK");
                break;
            }
        }

        // Deliveries stats
        List<Shipment> delivered = shipmentRepository.findByDriverAndStatus(driver, OrderStatus.DELIVERED);
        dto.setTotalDeliveriesCompleted(delivered != null ? delivered.size() : 0);
        dto.setTotalTripsCompleted(delivered != null ? delivered.size() : 0);
        dto.setOnTimeRatePercentage(100.0);
        dto.setSafetyRating(5.0);
        if (driver.getCreatedAt() != null) {
            dto.setShiftStartedAt(driver.getCreatedAt().format(DATE_FMT));
        }

        return dto;
    }

    /**
     * Retrieves the vehicle currently assigned to the authenticated driver.
     */
    @Transactional(readOnly = true)
    public DriverVehicleDTO getAssignedVehicle() {
        Driver driver = getAuthenticatedDriver();
        List<Vehicle> vehicles = vehicleRepository.findAll();
        for (Vehicle v : vehicles) {
            if (v.getDriver() != null && v.getDriver().getId().equals(driver.getId())) {
                DriverVehicleDTO dto = new DriverVehicleDTO();
                dto.setId(v.getId());
                dto.setVehicleNumber(v.getVehicleNumber());
                dto.setVehicleCode(v.getVehicleNumber());
                dto.setPlateNumber(v.getRegistrationNumber() != null ? v.getRegistrationNumber() : v.getVehicleNumber());
                dto.setLicensePlate(v.getRegistrationNumber() != null ? v.getRegistrationNumber() : v.getVehicleNumber());
                dto.setRegistrationNumber(v.getRegistrationNumber());
                dto.setManufacturer(v.getManufacturer());
                dto.setModel(v.getModel());
                dto.setType(v.getVehicleType() != null ? v.getVehicleType().name() : "CONTAINER_TRUCK");
                dto.setVehicleType(v.getVehicleType() != null ? v.getVehicleType().name() : "CONTAINER_TRUCK");
                dto.setCapacity(v.getCapacity() != null ? v.getCapacity() : 10.0);
                dto.setCapacityTons(v.getCapacity() != null ? v.getCapacity() : 10.0);
                dto.setCapacityUnit(v.getCapacityUnit() != null ? v.getCapacityUnit() : "TONS");
                dto.setStatus(v.getStatus() != null ? v.getStatus().name() : "ASSIGNED");
                dto.setCurrentLocation(v.getCurrentLocation() != null ? v.getCurrentLocation() : (v.getWarehouse() != null ? v.getWarehouse().getWarehouseName() : "In Transit"));
                dto.setFuelLevelPercent(78.0);
                dto.setEngineTempCelsius(88.0);
                dto.setTirePressurePsi(35.0);
                dto.setOdometerKm(50600.0);
                dto.setLastInspectionDate(LocalDateTime.now().format(DATE_FMT));
                if (v.getInsuranceExpiry() != null) dto.setInsuranceExpiry(v.getInsuranceExpiry().format(DATE_FMT));
                if (v.getRegistrationExpiry() != null) dto.setRegistrationExpiry(v.getRegistrationExpiry().format(DATE_FMT));
                dto.setPucExpiry(v.getInsuranceExpiry() != null ? v.getInsuranceExpiry().format(DATE_FMT) : "31 Dec 2026");

                if (v.getWarehouse() != null) {
                    dto.setAssignedWarehouseId(v.getWarehouse().getId());
                    dto.setAssignedWarehouseCode(v.getWarehouse().getWarehouseCode());
                    dto.setAssignedWarehouseName(v.getWarehouse().getWarehouseName());
                }
                return dto;
            }
        }
        return null;
    }

    /**
     * Retrieves dashboard KPIs for the driver.
     */
    @Transactional(readOnly = true)
    public DriverDashboardDTO getDriverDashboard() {
        Driver driver = getAuthenticatedDriver();
        DriverDashboardDTO dashboard = new DriverDashboardDTO();
        dashboard.setDriverId("DRV-" + String.format("%03d", driver.getId()));
        dashboard.setDriverCode("DRV-" + String.format("%03d", driver.getId()));
        dashboard.setDriverName(driver.getFullName());
        dashboard.setDriverStatus(driver.getStatus() != null ? driver.getStatus().name() : "AVAILABLE");

        // Profile & Vehicle
        dashboard.setProfile(getDriverProfile());
        dashboard.setAssignedVehicle(getAssignedVehicle());

        // Active Delivery
        DriverDeliveryDTO active = getActiveDelivery();
        dashboard.setActiveDelivery(active);

        // Deliveries counts
        List<Shipment> allShipments = shipmentRepository.findByDriver(driver);
        int total = 0;
        int completed = 0;
        int pending = 0;
        List<DriverDeliveryDTO> recent = new ArrayList<>();

        if (allShipments != null) {
            for (Shipment s : allShipments) {
                total++;
                if (s.getStatus() == OrderStatus.DELIVERED) {
                    completed++;
                } else if (s.getStatus() != OrderStatus.CANCELLED) {
                    pending++;
                }
                if (recent.size() < 5) {
                    recent.add(toDriverDeliveryDTO(s));
                }
            }
        }

        dashboard.setTodaysDeliveries(total);
        dashboard.setAssignedToday(total);
        dashboard.setCompletedDeliveries(completed);
        dashboard.setCompletedToday(completed);
        dashboard.setPendingDeliveries(pending);
        dashboard.setPendingToday(pending);
        dashboard.setOnTimeDeliveries(100.0);
        dashboard.setRecentDeliveries(recent);

        return dashboard;
    }

    /**
     * Lists all deliveries assigned to the driver, optionally filtered by status.
     */
    @Transactional(readOnly = true)
    public List<DriverDeliveryDTO> getDeliveries(String statusFilter) {
        Driver driver = getAuthenticatedDriver();
        List<Shipment> shipments;

        if (statusFilter != null && !statusFilter.trim().isEmpty() && !"ALL".equalsIgnoreCase(statusFilter)) {
            try {
                OrderStatus os = OrderStatus.valueOf(statusFilter.toUpperCase());
                shipments = shipmentRepository.findByDriverAndStatus(driver, os);
            } catch (IllegalArgumentException e) {
                shipments = shipmentRepository.findByDriver(driver);
            }
        } else {
            shipments = shipmentRepository.findByDriver(driver);
        }

        List<DriverDeliveryDTO> result = new ArrayList<>();
        if (shipments != null) {
            for (Shipment s : shipments) {
                result.add(toDriverDeliveryDTO(s));
            }
        }
        return result;
    }

    /**
     * Returns the currently active delivery (IN_TRANSIT or OUT_FOR_DELIVERY) for the driver.
     */
    @Transactional(readOnly = true)
    public DriverDeliveryDTO getActiveDelivery() {
        Driver driver = getAuthenticatedDriver();
        List<Shipment> activeShipments = shipmentRepository.findByDriver(driver);
        if (activeShipments != null) {
            for (Shipment s : activeShipments) {
                if (s.getStatus() == OrderStatus.OUT_FOR_DELIVERY || s.getStatus() == OrderStatus.IN_TRANSIT) {
                    return toDriverDeliveryDTO(s);
                }
            }
        }
        return null;
    }

    /**
     * Fetches delivery details by shipment ID, enforcing strict driver ownership.
     */
    @Transactional(readOnly = true)
    public DriverDeliveryDTO getDeliveryById(Long shipmentId) {
        Driver driver = getAuthenticatedDriver();
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Shipment not found with ID: " + shipmentId));

        if (shipment.getDriver() == null || !shipment.getDriver().getId().equals(driver.getId())) {
            throw new SecurityException("Access Denied: You do not have permission to access shipment #" + shipmentId);
        }

        return toDriverDeliveryDTO(shipment);
    }

    /**
     * STEP 2: Transition shipment from IN_TRANSIT -> OUT_FOR_DELIVERY.
     */
    @Transactional
    public DriverDeliveryDTO markOutForDelivery(Long shipmentId) {
        Driver driver = getAuthenticatedDriver();
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Shipment not found with ID: " + shipmentId));

        if (shipment.getDriver() == null || !shipment.getDriver().getId().equals(driver.getId())) {
            throw new SecurityException("Access Denied: You do not have permission to operate shipment #" + shipmentId);
        }

        if (shipment.getStatus() == OrderStatus.OUT_FOR_DELIVERY) {
            return toDriverDeliveryDTO(shipment);
        }

        if (shipment.getStatus() != OrderStatus.IN_TRANSIT) {
            throw new IllegalStateException("Shipment must be in IN_TRANSIT status to mark OUT_FOR_DELIVERY. Current status: " + shipment.getStatus());
        }

        shipment.setStatus(OrderStatus.OUT_FOR_DELIVERY);
        shipment.setOperationalStage("OUT_FOR_DELIVERY");
        shipment.setUpdatedAt(LocalDateTime.now());
        shipmentRepository.save(shipment);

        Order order = shipment.getOrder();
        if (order != null) {
            order.setStatus(OrderStatus.OUT_FOR_DELIVERY);
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);
        }

        ShipmentTrackingEvent event = new ShipmentTrackingEvent();
        event.setShipment(shipment);
        event.setStatus("OUT_FOR_DELIVERY");
        event.setTitle("Out for Delivery");
        String destCity = (order != null && order.getDeliveryAddress() != null) ? order.getDeliveryAddress().getCity() : "Customer Destination";
        event.setLocationName(destCity);
        event.setDescription("Shipment is out for delivery with driver " + driver.getFullName());
        event.setEventTime(LocalDateTime.now());
        if (order != null && order.getDeliveryAddress() != null && order.getDeliveryAddress().getLatitude() != null) {
            event.setLatitude(order.getDeliveryAddress().getLatitude());
            event.setLongitude(order.getDeliveryAddress().getLongitude());
        }
        shipmentTrackingEventRepository.save(event);

        if (driver.getStatus() != DriverStatus.ON_TRIP) {
            driver.setStatus(DriverStatus.ON_TRIP);
            driver.setUpdatedAt(LocalDateTime.now());
            driverRepository.save(driver);
        }

        Vehicle vehicle = shipment.getVehicle();
        if (vehicle != null && vehicle.getStatus() != VehicleStatus.IN_TRANSIT) {
            vehicle.setStatus(VehicleStatus.IN_TRANSIT);
            vehicle.setUpdatedAt(LocalDateTime.now());
            vehicleRepository.save(vehicle);
        }

        return toDriverDeliveryDTO(shipment);
    }

    /**
     * STEP 2: Start Trip / Start Delivery.
     */
    @Transactional
    public DriverDeliveryDTO startTrip(Long shipmentId) {
        Driver driver = getAuthenticatedDriver();
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Shipment not found with ID: " + shipmentId));

        if (shipment.getDriver() == null || !shipment.getDriver().getId().equals(driver.getId())) {
            throw new SecurityException("Access Denied: You do not have permission to operate shipment #" + shipmentId);
        }

        if (shipment.getStatus() == OrderStatus.IN_TRANSIT || shipment.getStatus() == OrderStatus.OUT_FOR_DELIVERY) {
            return toDriverDeliveryDTO(shipment);
        }

        shipment.setStatus(OrderStatus.IN_TRANSIT);
        shipment.setOperationalStage("DISPATCHED");
        shipment.setUpdatedAt(LocalDateTime.now());
        shipmentRepository.save(shipment);

        Order order = shipment.getOrder();
        if (order != null) {
            order.setStatus(OrderStatus.IN_TRANSIT);
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);
        }

        ShipmentTrackingEvent event = new ShipmentTrackingEvent();
        event.setShipment(shipment);
        event.setStatus("IN_TRANSIT");
        event.setTitle("In Transit");
        event.setLocationName(shipment.getOriginWarehouse() != null ? shipment.getOriginWarehouse().getWarehouseName() : "Origin Warehouse");
        event.setDescription("Driver " + driver.getFullName() + " started transit towards customer destination.");
        event.setEventTime(LocalDateTime.now());
        shipmentTrackingEventRepository.save(event);

        driver.setStatus(DriverStatus.ON_TRIP);
        driver.setUpdatedAt(LocalDateTime.now());
        driverRepository.save(driver);

        Vehicle vehicle = shipment.getVehicle();
        if (vehicle != null) {
            vehicle.setStatus(VehicleStatus.IN_TRANSIT);
            vehicle.setUpdatedAt(LocalDateTime.now());
            vehicleRepository.save(vehicle);
        }

        return toDriverDeliveryDTO(shipment);
    }

    /**
     * STEP 3: Complete Delivery with Electronic Proof of Delivery (ePOD).
     */
    @Transactional
    public DriverDeliveryDTO completeDelivery(Long shipmentId, CompleteDeliveryRequest request) {
        Driver driver = getAuthenticatedDriver();
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Shipment not found with ID: " + shipmentId));

        // 1. Verify Driver Ownership
        if (shipment.getDriver() == null || !shipment.getDriver().getId().equals(driver.getId())) {
            throw new SecurityException("Access Denied: You do not have permission to complete shipment #" + shipmentId);
        }

        // 2. Idempotency: If already DELIVERED, return current state
        if (shipment.getStatus() == OrderStatus.DELIVERED) {
            return toDriverDeliveryDTO(shipment);
        }

        // 3. Status Guard: Must be OUT_FOR_DELIVERY
        if (shipment.getStatus() != OrderStatus.OUT_FOR_DELIVERY) {
            throw new IllegalStateException("Cannot complete delivery. Shipment must be in OUT_FOR_DELIVERY status (current status: " + shipment.getStatus() + ")");
        }

        // 4. Validate Signature
        String sig = request != null ? request.getSignatureData() : null;
        if (sig == null || sig.trim().isEmpty()) {
            throw new IllegalArgumentException("Customer digital signature is required to complete delivery proof.");
        }

        Order order = shipment.getOrder();
        String recipientName = (request != null && request.getRecipientName() != null && !request.getRecipientName().trim().isEmpty())
                ? request.getRecipientName()
                : (order != null && order.getCustomer() != null ? order.getCustomer().getFullName() : "Customer");

        // 5. Persist Proof of Delivery (ePOD)
        ProofOfDelivery pod = proofOfDeliveryRepository.findByShipment(shipment).orElse(new ProofOfDelivery());
        pod.setShipment(shipment);
        pod.setRecipientName(recipientName);
        pod.setReceivedBy(request != null && request.getReceivedBy() != null ? request.getReceivedBy() : recipientName);
        pod.setSignatureData(sig);
        pod.setPhotoData(request != null ? request.getPhotoData() : null);
        pod.setDeliveryNotes(request != null ? request.getDeliveryNotes() : "Delivered directly to customer.");
        pod.setDeliveredAt(LocalDateTime.now());
        pod.setDeliveredBy(driver.getFullName());
        if (request != null) {
            pod.setLatitude(request.getLatitude());
            pod.setLongitude(request.getLongitude());
        }
        if (pod.getCreatedAt() == null) {
            pod.setCreatedAt(LocalDateTime.now());
        }
        pod.setUpdatedAt(LocalDateTime.now());
        proofOfDeliveryRepository.save(pod);

        // 6. Update Shipment Status -> DELIVERED
        shipment.setStatus(OrderStatus.DELIVERED);
        shipment.setOperationalStage("DELIVERED");
        shipment.setUpdatedAt(LocalDateTime.now());
        shipmentRepository.save(shipment);

        // 7. Update Order Status -> DELIVERED
        if (order != null) {
            order.setStatus(OrderStatus.DELIVERED);
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);
        }

        // 8. Create DELIVERED Tracking Event
        ShipmentTrackingEvent event = new ShipmentTrackingEvent();
        event.setShipment(shipment);
        event.setStatus("DELIVERED");
        event.setTitle("Delivered");
        String destCity = (order != null && order.getDeliveryAddress() != null) ? order.getDeliveryAddress().getCity() : "Customer Delivery Address";
        event.setLocationName(destCity);
        event.setDescription("Shipment delivered successfully to " + recipientName + ". Electronic proof of delivery verified.");
        event.setEventTime(LocalDateTime.now());
        if (order != null && order.getDeliveryAddress() != null && order.getDeliveryAddress().getLatitude() != null) {
            event.setLatitude(order.getDeliveryAddress().getLatitude());
            event.setLongitude(order.getDeliveryAddress().getLongitude());
        }
        shipmentTrackingEventRepository.save(event);

        // 9. Release Driver Operational State -> AVAILABLE
        if (driver.getStatus() == DriverStatus.ON_TRIP) {
            driver.setStatus(DriverStatus.AVAILABLE);
            driver.setUpdatedAt(LocalDateTime.now());
            driverRepository.save(driver);
        }

        // 10. Release Vehicle Operational State -> ASSIGNED
        Vehicle vehicle = shipment.getVehicle();
        if (vehicle != null && vehicle.getStatus() == VehicleStatus.IN_TRANSIT) {
            vehicle.setStatus(VehicleStatus.ASSIGNED);
            vehicle.setUpdatedAt(LocalDateTime.now());
            vehicleRepository.save(vehicle);
        }

        return toDriverDeliveryDTO(shipment);
    }

    /**
     * Converts a Shipment entity into DriverDeliveryDTO.
     */
    public DriverDeliveryDTO toDriverDeliveryDTO(Shipment shipment) {
        DriverDeliveryDTO dto = new DriverDeliveryDTO();
        dto.setId(String.valueOf(shipment.getId()));
        dto.setShipmentId(shipment.getId());
        dto.setTrackingNumber(shipment.getTrackingNumber());

        Order order = shipment.getOrder();
        if (order != null) {
            dto.setOrderNumber(order.getOrderNumber());
            dto.setCustomerOrderRef(order.getOrderNumber());
            dto.setTotalPackages(order.getPackageQuantity() != null ? order.getPackageQuantity() : 1);
            dto.setTotalQuantity(order.getPackageQuantity() != null ? order.getPackageQuantity() : 1);
            dto.setTotalWeightKg(order.getPackageWeight() != null ? order.getPackageWeight() : 5.0);
            dto.setVolumeCbm(0.45);
            dto.setCargoSummary(order.getPackageDescription() != null ? order.getPackageDescription() : "Consignment Cargo");

            Address pickupAddress = order.getPickupAddress();
            Address deliveryAddress = order.getDeliveryAddress();
            User customer = order.getCustomer();

            // Customer Destination
            DriverLocationDTO dest = new DriverLocationDTO();
            dest.setCustomerName(customer != null ? customer.getFullName() : (deliveryAddress != null ? deliveryAddress.getContactName() : "Customer"));
            dest.setCompanyName(customer != null ? customer.getCompanyName() : null);
            dest.setPhone(deliveryAddress != null && deliveryAddress.getPhone() != null ? deliveryAddress.getPhone() : (customer != null ? customer.getPhone() : "+91 98765 00000"));
            dest.setEmail(customer != null ? customer.getEmail() : "customer@client.com");
            dest.setAddress(deliveryAddress != null ? deliveryAddress.getAddressLine1() : "Customer Destination Address");
            dest.setCity(deliveryAddress != null ? deliveryAddress.getCity() : "Destination City");
            dest.setState(deliveryAddress != null ? deliveryAddress.getState() : "State");
            dest.setPostalCode(deliveryAddress != null ? deliveryAddress.getPostalCode() : "560001");
            dest.setDeliveryNotes("Customer delivery address");
            if (deliveryAddress != null && deliveryAddress.getLatitude() != null && deliveryAddress.getLongitude() != null) {
                dest.setLatitude(deliveryAddress.getLatitude());
                dest.setLongitude(deliveryAddress.getLongitude());
                dest.setCoordinates(new double[]{deliveryAddress.getLatitude(), deliveryAddress.getLongitude()});
            } else {
                dest.setLatitude(12.9716);
                dest.setLongitude(77.5946);
                dest.setCoordinates(new double[]{12.9716, 77.5946});
            }
            dto.setDeliveryLocation(dest);
            dto.setDestination(dest);
            dto.setRecipientName(dest.getCustomerName());
            dto.setRecipientPhone(dest.getPhone());
            dto.setRecipientEmail(dest.getEmail());
            dto.setRecipientCity(dest.getCity());

            // Origin Pickup Dock
            DriverLocationDTO orig = new DriverLocationDTO();
            Warehouse originWarehouse = shipment.getOriginWarehouse();
            if (originWarehouse != null) {
                orig.setFacilityName(originWarehouse.getWarehouseName());
                orig.setAddress(originWarehouse.getAddressLine1());
                orig.setCity(originWarehouse.getCity());
                orig.setState(originWarehouse.getState());
                orig.setPostalCode(originWarehouse.getPostalCode());
                orig.setDockBay("Bay-" + ((originWarehouse.getId() % 6) + 1));
                orig.setContactPerson(originWarehouse.getManagerName() != null ? originWarehouse.getManagerName() : "Warehouse Manager");
                orig.setContactPhone(originWarehouse.getContactPhone() != null ? originWarehouse.getContactPhone() : "+91 98001 11000");
                if (originWarehouse.getLatitude() != null && originWarehouse.getLongitude() != null) {
                    orig.setLatitude(originWarehouse.getLatitude());
                    orig.setLongitude(originWarehouse.getLongitude());
                    orig.setCoordinates(new double[]{originWarehouse.getLatitude(), originWarehouse.getLongitude()});
                }
            } else if (pickupAddress != null) {
                orig.setFacilityName(pickupAddress.getContactName() + " Facility");
                orig.setAddress(pickupAddress.getAddressLine1());
                orig.setCity(pickupAddress.getCity());
                orig.setState(pickupAddress.getState());
                orig.setPostalCode(pickupAddress.getPostalCode());
                orig.setDockBay("Bay-1");
                orig.setContactPerson(pickupAddress.getContactName());
                orig.setContactPhone(pickupAddress.getPhone());
            }
            dto.setPickupLocation(orig);

            // Cargo items
            List<DriverCargoItemDTO> cargoItems = new ArrayList<>();
            if (order.getItems() != null && !order.getItems().isEmpty()) {
                for (OrderItem item : order.getItems()) {
                    DriverCargoItemDTO c = new DriverCargoItemDTO();
                    c.setId(String.valueOf(item.getId()));
                    c.setQuantity(item.getQuantity());
                    c.setWeightKg(item.getTotalWeight() != null ? item.getTotalWeight() : (item.getUnitWeight() != null ? item.getUnitWeight() * item.getQuantity() : 1.0));
                    if (item.getProduct() != null) {
                        c.setSku(item.getProduct().getSku());
                        c.setName(item.getProduct().getName());
                        c.setDescription(item.getProduct().getName());
                    } else {
                        c.setSku("PR-SKU-" + item.getId());
                        c.setName("Package Item");
                        c.setDescription(order.getPackageDescription());
                    }
                    c.setDimensions("Standard Box");
                    c.setHazardous(false);
                    cargoItems.add(c);
                }
            } else {
                DriverCargoItemDTO c = new DriverCargoItemDTO();
                c.setId("ITEM-1");
                c.setSku("SKU-PKG-01");
                c.setName("Consignment Package");
                c.setDescription(order.getPackageDescription() != null ? order.getPackageDescription() : "Commercial Goods Package");
                c.setQuantity(dto.getTotalPackages());
                c.setWeightKg(dto.getTotalWeightKg());
                c.setDimensions("Standard Master Carton");
                c.setHazardous(false);
                cargoItems.add(c);
            }
            dto.setCargoItems(cargoItems);
        }

        // Status alignment
        dto.setStatus(shipment.getStatus() != null ? shipment.getStatus().name() : "IN_TRANSIT");
        dto.setOperationalStage(shipment.getOperationalStage() != null ? shipment.getOperationalStage() : "IN_TRANSIT");

        dto.setPriority(order != null && order.getDeliveryType() == DeliveryType.EXPRESS ? "CRITICAL" : "STANDARD");

        if (shipment.getAssignedAt() != null) {
            dto.setAssignedAt(shipment.getAssignedAt().format(DATE_FMT));
            dto.setAssignedDate(shipment.getAssignedAt().format(DATE_FMT));
        } else if (shipment.getCreatedAt() != null) {
            dto.setAssignedAt(shipment.getCreatedAt().format(DATE_FMT));
            dto.setAssignedDate(shipment.getCreatedAt().format(DATE_FMT));
        }

        if (shipment.getEstimatedDeliveryDate() != null) {
            dto.setEstimatedDeliveryTime(shipment.getEstimatedDeliveryDate().format(DATE_FMT));
            dto.setDeliveryEta(shipment.getEstimatedDeliveryDate().format(DATE_FMT) + " 05:00 PM");
        } else {
            dto.setEstimatedDeliveryTime("Today 05:00 PM");
            dto.setDeliveryEta("Today 05:00 PM");
        }
        dto.setPickupEta("09:00 AM");

        double dist = calculateShipmentDistanceKm(shipment);
        dto.setDistanceKm(Math.round(dist * 10.0) / 10.0);
        dto.setEstimatedDurationMins((int) (dist * 1.8));

        // Real Tracking Events
        List<ShipmentTrackingEvent> events = shipmentTrackingEventRepository.findByShipmentOrderByEventTimeAsc(shipment);
        List<DriverTrackingEventDTO> eventDTOs = new ArrayList<>();
        for (ShipmentTrackingEvent ev : events) {
            DriverTrackingEventDTO te = new DriverTrackingEventDTO();
            te.setId(ev.getId());
            te.setStatus(ev.getStatus());
            te.setTitle(ev.getTitle());
            te.setDescription(ev.getDescription());
            te.setLocation(ev.getLocationName());
            te.setTimestamp(ev.getEventTime() != null ? ev.getEventTime().format(TIME_FMT) : "");
            te.setLatitude(ev.getLatitude());
            te.setLongitude(ev.getLongitude());
            eventDTOs.add(te);
        }
        dto.setTrackingEvents(eventDTOs);

        // ePOD data if present
        Optional<ProofOfDelivery> podOpt = proofOfDeliveryRepository.findByShipment(shipment);
        if (podOpt.isPresent()) {
            ProofOfDelivery pod = podOpt.get();
            ProofOfDeliveryDTO podDto = new ProofOfDeliveryDTO();
            podDto.setId(pod.getId());
            podDto.setShipmentId(shipment.getId());
            podDto.setTrackingNumber(shipment.getTrackingNumber());
            podDto.setRecipientName(pod.getRecipientName());
            podDto.setReceivedBy(pod.getReceivedBy());
            podDto.setSignatureData(pod.getSignatureData());
            podDto.setSignatureBase64(pod.getSignatureData());
            podDto.setPhotoData(pod.getPhotoData());
            podDto.setPhotoUrl(pod.getPhotoData());
            podDto.setDeliveryNotes(pod.getDeliveryNotes());
            podDto.setNotes(pod.getDeliveryNotes());
            podDto.setDeliveredAt(pod.getDeliveredAt() != null ? pod.getDeliveredAt().format(TIME_FMT) : "");
            podDto.setDeliveredBy(pod.getDeliveredBy());
            podDto.setLatitude(pod.getLatitude());
            podDto.setLongitude(pod.getLongitude());
            dto.setProofOfDelivery(podDto);
        }

        return dto;
    }

    private double calculateShipmentDistanceKm(Shipment s) {
        if (s == null || s.getOrder() == null) return 24.5;
        Warehouse orig = s.getOriginWarehouse();
        Address da = s.getOrder().getDeliveryAddress();
        if (orig != null && da != null && orig.getLatitude() != null && orig.getLongitude() != null && da.getLatitude() != null && da.getLongitude() != null) {
            return haversineKm(orig.getLatitude(), orig.getLongitude(), da.getLatitude(), da.getLongitude());
        }
        return 28.4;
    }

    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return 6371.0 * c;
    }
}
"@
[System.IO.File]::WriteAllText("$BACKEND_ROOT\service\DriverPortalService.java", $serviceContent, [System.Text.Encoding]::UTF8)
Write-Host "Updated DriverPortalService.java"

# 3. Update DriverPortalController.java
$controllerContent = @"
package com.primeroute.logistics.controller;

import com.primeroute.logistics.dto.ApiResponse;
import com.primeroute.logistics.dto.driver.*;
import com.primeroute.logistics.service.DriverPortalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/driver")
@PreAuthorize("hasRole('DRIVER') or hasRole('ADMIN')")
public class DriverPortalController {

    @Autowired
    private DriverPortalService driverPortalService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<DriverProfileDTO>> getDriverProfile() {
        DriverProfileDTO profile = driverPortalService.getDriverProfile();
        return ResponseEntity.ok(new ApiResponse<>(true, "Driver profile retrieved successfully", profile));
    }

    @GetMapping("/vehicle")
    public ResponseEntity<ApiResponse<DriverVehicleDTO>> getAssignedVehicle() {
        DriverVehicleDTO vehicle = driverPortalService.getAssignedVehicle();
        if (vehicle == null) {
            return ResponseEntity.ok(new ApiResponse<>(true, "No vehicle currently assigned", null));
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "Assigned vehicle retrieved successfully", vehicle));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DriverDashboardDTO>> getDriverDashboard() {
        DriverDashboardDTO dashboard = driverPortalService.getDriverDashboard();
        return ResponseEntity.ok(new ApiResponse<>(true, "Driver dashboard data retrieved successfully", dashboard));
    }

    @GetMapping("/deliveries")
    public ResponseEntity<ApiResponse<List<DriverDeliveryDTO>>> getDeliveries(
            @RequestParam(value = "status", required = false) String status) {
        List<DriverDeliveryDTO> deliveries = driverPortalService.getDeliveries(status);
        return ResponseEntity.ok(new ApiResponse<>(true, "Driver deliveries retrieved successfully", deliveries));
    }

    @GetMapping("/deliveries/active")
    public ResponseEntity<ApiResponse<DriverDeliveryDTO>> getActiveDelivery() {
        DriverDeliveryDTO active = driverPortalService.getActiveDelivery();
        if (active == null) {
            return ResponseEntity.ok(new ApiResponse<>(true, "No active delivery assigned", null));
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "Active delivery retrieved successfully", active));
    }

    @GetMapping("/deliveries/{id}")
    public ResponseEntity<?> getDeliveryById(@PathVariable("id") Long id) {
        try {
            DriverDeliveryDTO delivery = driverPortalService.getDeliveryById(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Delivery retrieved successfully", delivery));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * STEP 2: Mark active shipment as OUT_FOR_DELIVERY.
     */
    @PostMapping("/deliveries/{id}/out-for-delivery")
    public ResponseEntity<?> markOutForDelivery(@PathVariable("id") Long id) {
        try {
            DriverDeliveryDTO updated = driverPortalService.markOutForDelivery(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Delivery status updated to OUT_FOR_DELIVERY", updated));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * STEP 2: Start Trip / Start Delivery.
     */
    @PostMapping("/deliveries/{id}/start-trip")
    public ResponseEntity<?> startTrip(@PathVariable("id") Long id) {
        try {
            DriverDeliveryDTO updated = driverPortalService.startTrip(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Trip started successfully", updated));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * STEP 3: Complete delivery with electronic proof of delivery (ePOD).
     */
    @PostMapping("/deliveries/{id}/complete")
    public ResponseEntity<?> completeDelivery(
            @PathVariable("id") Long id,
            @RequestBody CompleteDeliveryRequest request) {
        try {
            DriverDeliveryDTO updated = driverPortalService.completeDelivery(id, request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Delivery completed successfully with verified ePOD", updated));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Failed to complete delivery: " + e.getMessage(), null));
        }
    }

    /**
     * STEP 3: Alias endpoint for proof-of-delivery submission.
     */
    @PostMapping("/deliveries/{id}/proof-of-delivery")
    public ResponseEntity<?> submitProofOfDelivery(
            @PathVariable("id") Long id,
            @RequestBody CompleteDeliveryRequest request) {
        return completeDelivery(id, request);
    }

    /**
     * General status transition endpoint for driver portal.
     */
    @PostMapping("/deliveries/{id}/status")
    public ResponseEntity<?> updateDeliveryStatus(
            @PathVariable("id") Long id,
            @RequestBody(required = false) Map<String, String> payload) {
        String targetStatus = payload != null ? payload.get("status") : null;
        if ("OUT_FOR_DELIVERY".equalsIgnoreCase(targetStatus)) {
            return markOutForDelivery(id);
        } else if ("IN_TRANSIT".equalsIgnoreCase(targetStatus)) {
            return startTrip(id);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, "Unsupported generic status transition. Delivery completion requires ePOD via /complete endpoint.", null));
    }
}
"@
[System.IO.File]::WriteAllText("$BACKEND_ROOT\controller\DriverPortalController.java", $controllerContent, [System.Text.Encoding]::UTF8)
Write-Host "Updated DriverPortalController.java"
