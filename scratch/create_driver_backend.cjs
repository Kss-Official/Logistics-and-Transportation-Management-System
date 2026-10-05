const fs = require('fs');
const path = require('path');

const base = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics';
const dtoDir = path.join(base, 'dto', 'driver');
if (!fs.existsSync(dtoDir)) {
  fs.mkdirSync(dtoDir, { recursive: true });
}

// 1. DriverProfileDTO.java
fs.writeFileSync(path.join(dtoDir, 'DriverProfileDTO.java'), `package com.primeroute.logistics.dto.driver;

public class DriverProfileDTO {
    private Long id;
    private String driverCode;
    private String driverId;
    private String fullName;
    private String name;
    private String email;
    private String phone;
    private String licenseNumber;
    private String licenseExpiry;
    private String address;
    private String status;
    private Long assignedWarehouseId;
    private String assignedWarehouseCode;
    private String assignedWarehouseName;
    private String assignedHub;
    private Long assignedVehicleId;
    private String assignedVehicleCode;
    private String assignedVehiclePlate;
    private String assignedVehicleModel;
    private String assignedVehicleType;
    private int totalTripsCompleted;
    private int totalDeliveriesCompleted;
    private double onTimeRatePercentage;
    private double safetyRating;
    private String shiftStartedAt;

    public DriverProfileDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDriverCode() { return driverCode; }
    public void setDriverCode(String driverCode) { this.driverCode = driverCode; }

    public String getDriverId() { return driverId; }
    public void setDriverId(String driverId) { this.driverId = driverId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public String getLicenseExpiry() { return licenseExpiry; }
    public void setLicenseExpiry(String licenseExpiry) { this.licenseExpiry = licenseExpiry; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getAssignedWarehouseId() { return assignedWarehouseId; }
    public void setAssignedWarehouseId(Long assignedWarehouseId) { this.assignedWarehouseId = assignedWarehouseId; }

    public String getAssignedWarehouseCode() { return assignedWarehouseCode; }
    public void setAssignedWarehouseCode(String assignedWarehouseCode) { this.assignedWarehouseCode = assignedWarehouseCode; }

    public String getAssignedWarehouseName() { return assignedWarehouseName; }
    public void setAssignedWarehouseName(String assignedWarehouseName) { this.assignedWarehouseName = assignedWarehouseName; }

    public String getAssignedHub() { return assignedHub; }
    public void setAssignedHub(String assignedHub) { this.assignedHub = assignedHub; }

    public Long getAssignedVehicleId() { return assignedVehicleId; }
    public void setAssignedVehicleId(Long assignedVehicleId) { this.assignedVehicleId = assignedVehicleId; }

    public String getAssignedVehicleCode() { return assignedVehicleCode; }
    public void setAssignedVehicleCode(String assignedVehicleCode) { this.assignedVehicleCode = assignedVehicleCode; }

    public String getAssignedVehiclePlate() { return assignedVehiclePlate; }
    public void setAssignedVehiclePlate(String assignedVehiclePlate) { this.assignedVehiclePlate = assignedVehiclePlate; }

    public String getAssignedVehicleModel() { return assignedVehicleModel; }
    public void setAssignedVehicleModel(String assignedVehicleModel) { this.assignedVehicleModel = assignedVehicleModel; }

    public String getAssignedVehicleType() { return assignedVehicleType; }
    public void setAssignedVehicleType(String assignedVehicleType) { this.assignedVehicleType = assignedVehicleType; }

    public int getTotalTripsCompleted() { return totalTripsCompleted; }
    public void setTotalTripsCompleted(int totalTripsCompleted) { this.totalTripsCompleted = totalTripsCompleted; }

    public int getTotalDeliveriesCompleted() { return totalDeliveriesCompleted; }
    public void setTotalDeliveriesCompleted(int totalDeliveriesCompleted) { this.totalDeliveriesCompleted = totalDeliveriesCompleted; }

    public double getOnTimeRatePercentage() { return onTimeRatePercentage; }
    public void setOnTimeRatePercentage(double onTimeRatePercentage) { this.onTimeRatePercentage = onTimeRatePercentage; }

    public double getSafetyRating() { return safetyRating; }
    public void setSafetyRating(double safetyRating) { this.safetyRating = safetyRating; }

    public String getShiftStartedAt() { return shiftStartedAt; }
    public void setShiftStartedAt(String shiftStartedAt) { this.shiftStartedAt = shiftStartedAt; }
}
`);

// 2. DriverVehicleDTO.java
fs.writeFileSync(path.join(dtoDir, 'DriverVehicleDTO.java'), `package com.primeroute.logistics.dto.driver;

public class DriverVehicleDTO {
    private Long id;
    private String vehicleNumber;
    private String vehicleCode;
    private String registrationNumber;
    private String plateNumber;
    private String licensePlate;
    private String vehicleType;
    private String type;
    private String manufacturer;
    private String model;
    private Double capacity;
    private Double capacityTons;
    private String capacityUnit;
    private String status;
    private String currentLocation;
    private Long assignedWarehouseId;
    private String assignedWarehouseCode;
    private String assignedWarehouseName;
    private String lastInspectionDate;
    private String registrationExpiry;
    private String insuranceExpiry;
    private String pucExpiry;
    private int fuelLevelPercent;
    private int odometerKm;
    private int engineTempCelsius;
    private int tirePressurePsi;

    public DriverVehicleDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public String getVehicleCode() { return vehicleCode; }
    public void setVehicleCode(String vehicleCode) { this.vehicleCode = vehicleCode; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public String getPlateNumber() { return plateNumber; }
    public void setPlateNumber(String plateNumber) { this.plateNumber = plateNumber; }

    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getManufacturer() { return manufacturer; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Double getCapacity() { return capacity; }
    public void setCapacity(Double capacity) { this.capacity = capacity; }

    public Double getCapacityTons() { return capacityTons; }
    public void setCapacityTons(Double capacityTons) { this.capacityTons = capacityTons; }

    public String getCapacityUnit() { return capacityUnit; }
    public void setCapacityUnit(String capacityUnit) { this.capacityUnit = capacityUnit; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(String currentLocation) { this.currentLocation = currentLocation; }

    public Long getAssignedWarehouseId() { return assignedWarehouseId; }
    public void setAssignedWarehouseId(Long assignedWarehouseId) { this.assignedWarehouseId = assignedWarehouseId; }

    public String getAssignedWarehouseCode() { return assignedWarehouseCode; }
    public void setAssignedWarehouseCode(String assignedWarehouseCode) { this.assignedWarehouseCode = assignedWarehouseCode; }

    public String getAssignedWarehouseName() { return assignedWarehouseName; }
    public void setAssignedWarehouseName(String assignedWarehouseName) { this.assignedWarehouseName = assignedWarehouseName; }

    public String getLastInspectionDate() { return lastInspectionDate; }
    public void setLastInspectionDate(String lastInspectionDate) { this.lastInspectionDate = lastInspectionDate; }

    public String getRegistrationExpiry() { return registrationExpiry; }
    public void setRegistrationExpiry(String registrationExpiry) { this.registrationExpiry = registrationExpiry; }

    public String getInsuranceExpiry() { return insuranceExpiry; }
    public void setInsuranceExpiry(String insuranceExpiry) { this.insuranceExpiry = insuranceExpiry; }

    public String getPucExpiry() { return pucExpiry; }
    public void setPucExpiry(String pucExpiry) { this.pucExpiry = pucExpiry; }

    public int getFuelLevelPercent() { return fuelLevelPercent; }
    public void setFuelLevelPercent(int fuelLevelPercent) { this.fuelLevelPercent = fuelLevelPercent; }

    public int getOdometerKm() { return odometerKm; }
    public void setOdometerKm(int odometerKm) { this.odometerKm = odometerKm; }

    public int getEngineTempCelsius() { return engineTempCelsius; }
    public void setEngineTempCelsius(int engineTempCelsius) { this.engineTempCelsius = engineTempCelsius; }

    public int getTirePressurePsi() { return tirePressurePsi; }
    public void setTirePressurePsi(int tirePressurePsi) { this.tirePressurePsi = tirePressurePsi; }
}
`);

// 3. DriverCargoItemDTO.java
fs.writeFileSync(path.join(dtoDir, 'DriverCargoItemDTO.java'), `package com.primeroute.logistics.dto.driver;

public class DriverCargoItemDTO {
    private String id;
    private String name;
    private String sku;
    private Integer quantity;
    private Double weightKg;
    private String description;
    private String dimensions;
    private boolean hazardous;

    public DriverCargoItemDTO() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Double getWeightKg() { return weightKg; }
    public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDimensions() { return dimensions; }
    public void setDimensions(String dimensions) { this.dimensions = dimensions; }

    public boolean isHazardous() { return hazardous; }
    public void setHazardous(boolean hazardous) { this.hazardous = hazardous; }
}
`);

// 4. DriverLocationDTO.java
fs.writeFileSync(path.join(dtoDir, 'DriverLocationDTO.java'), `package com.primeroute.logistics.dto.driver;

public class DriverLocationDTO {
    private String facilityName;
    private String customerName;
    private String companyName;
    private String contactPerson;
    private String contactPhone;
    private String phone;
    private String email;
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private String dockBay;
    private String specialInstructions;
    private String deliveryNotes;
    private Double latitude;
    private Double longitude;
    private double[] coordinates;

    public DriverLocationDTO() {}

    public String getFacilityName() { return facilityName; }
    public void setFacilityName(String facilityName) { this.facilityName = facilityName; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public String getDockBay() { return dockBay; }
    public void setDockBay(String dockBay) { this.dockBay = dockBay; }

    public String getSpecialInstructions() { return specialInstructions; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }

    public String getDeliveryNotes() { return deliveryNotes; }
    public void setDeliveryNotes(String deliveryNotes) { this.deliveryNotes = deliveryNotes; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public double[] getCoordinates() { return coordinates; }
    public void setCoordinates(double[] coordinates) { this.coordinates = coordinates; }
}
`);

// 5. DriverDeliveryDTO.java
fs.writeFileSync(path.join(dtoDir, 'DriverDeliveryDTO.java'), `package com.primeroute.logistics.dto.driver;

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

    public double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(double distanceKm) { this.distanceKm = distanceKm; }

    public int getEstimatedDurationMins() { return estimatedDurationMins; }
    public void setEstimatedDurationMins(int estimatedDurationMins) { this.estimatedDurationMins = estimatedDurationMins; }
}
`);

// 6. DriverDashboardDTO.java
fs.writeFileSync(path.join(dtoDir, 'DriverDashboardDTO.java'), `package com.primeroute.logistics.dto.driver;

import java.util.ArrayList;
import java.util.List;

public class DriverDashboardDTO {
    private String driverName;
    private String driverId;
    private String driverCode;
    private String driverStatus;
    private DriverProfileDTO profile;
    private DriverVehicleDTO assignedVehicle;
    private int todaysDeliveries;
    private int assignedToday;
    private int completedDeliveries;
    private int completedToday;
    private int pendingDeliveries;
    private int pendingToday;
    private Double distanceKmToday;
    private Double distanceCoveredTodayKm;
    private double onTimeDeliveries;
    private DriverDeliveryDTO activeDelivery;
    private List<DriverDeliveryDTO> recentDeliveries = new ArrayList<>();

    public DriverDashboardDTO() {}

    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }

    public String getDriverId() { return driverId; }
    public void setDriverId(String driverId) { this.driverId = driverId; }

    public String getDriverCode() { return driverCode; }
    public void setDriverCode(String driverCode) { this.driverCode = driverCode; }

    public String getDriverStatus() { return driverStatus; }
    public void setDriverStatus(String driverStatus) { this.driverStatus = driverStatus; }

    public DriverProfileDTO getProfile() { return profile; }
    public void setProfile(DriverProfileDTO profile) { this.profile = profile; }

    public DriverVehicleDTO getAssignedVehicle() { return assignedVehicle; }
    public void setAssignedVehicle(DriverVehicleDTO assignedVehicle) { this.assignedVehicle = assignedVehicle; }

    public int getTodaysDeliveries() { return todaysDeliveries; }
    public void setTodaysDeliveries(int todaysDeliveries) { this.todaysDeliveries = todaysDeliveries; }

    public int getAssignedToday() { return assignedToday; }
    public void setAssignedToday(int assignedToday) { this.assignedToday = assignedToday; }

    public int getCompletedDeliveries() { return completedDeliveries; }
    public void setCompletedDeliveries(int completedDeliveries) { this.completedDeliveries = completedDeliveries; }

    public int getCompletedToday() { return completedToday; }
    public void setCompletedToday(int completedToday) { this.completedToday = completedToday; }

    public int getPendingDeliveries() { return pendingDeliveries; }
    public void setPendingDeliveries(int pendingDeliveries) { this.pendingDeliveries = pendingDeliveries; }

    public int getPendingToday() { return pendingToday; }
    public void setPendingToday(int pendingToday) { this.pendingToday = pendingToday; }

    public Double getDistanceKmToday() { return distanceKmToday; }
    public void setDistanceKmToday(Double distanceKmToday) { this.distanceKmToday = distanceKmToday; }

    public Double getDistanceCoveredTodayKm() { return distanceCoveredTodayKm; }
    public void setDistanceCoveredTodayKm(Double distanceCoveredTodayKm) { this.distanceCoveredTodayKm = distanceCoveredTodayKm; }

    public double getOnTimeDeliveries() { return onTimeDeliveries; }
    public void setOnTimeDeliveries(double onTimeDeliveries) { this.onTimeDeliveries = onTimeDeliveries; }

    public DriverDeliveryDTO getActiveDelivery() { return activeDelivery; }
    public void setActiveDelivery(DriverDeliveryDTO activeDelivery) { this.activeDelivery = activeDelivery; }

    public List<DriverDeliveryDTO> getRecentDeliveries() { return recentDeliveries; }
    public void setRecentDeliveries(List<DriverDeliveryDTO> recentDeliveries) { this.recentDeliveries = recentDeliveries; }
}
`);

console.log('All Driver DTOs successfully created.');
