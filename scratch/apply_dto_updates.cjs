const fs = require('fs');
const base = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

// 1. Update TrackingResponseDTO.java
const trackingResponseDTOContent = `package com.primeroute.logistics.dto;

import com.primeroute.logistics.dto.driver.ProofOfDeliveryDTO;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class TrackingResponseDTO {

    private Long shipmentId;
    private String trackingNumber;
    private String orderNumber;
    private String customerName;
    private String customerEmail;
    private String status;
    private String operationalStage;
    private String assignmentStatus;
    private String assignedBy;
    private LocalDateTime assignedAt;
    private String driverName;
    private String driverCode;
    private String driverPhone;
    private String driverStatus;
    private String vehicleNumber;
    private String vehicleModel;
    private String vehicleType;
    private String vehicleRegistrationNumber;
    private String vehicleReg;
    private String originWarehouseName;
    private String originWarehouseCode;
    private String warehouseManagerName;
    private String warehouseManagerEmail;
    private String pickupAddress;
    private String deliveryAddress;
    private String originName;
    private String destinationAddress;
    private LocationDTO pickup;
    private LocationDTO delivery;
    private CurrentLocationDTO currentLocation;
    private PackageDTO packageDetails;
    private String packageDescription;
    private Double packageWeight;
    private Integer packageQuantity;
    private String deliveryType;
    private LocalDate estimatedDeliveryDate;
    private Double currentLatitude;
    private Double currentLongitude;
    private String currentLocationName;
    private LocalDateTime lastLocationUpdatedAt;
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdatedAt;
    private LocalDateTime updatedAt;
    private ProofOfDeliveryDTO proofOfDelivery;
    private List<TrackingEventDTO> events = new ArrayList<>();
    private List<TrackingEventDTO> trackingEvents = new ArrayList<>();

    public static class LocationDTO {
        private String contactName;
        private String phone;
        private String addressText;
        private String city;
        private String state;
        private String postalCode;
        private String country;
        private Double latitude;
        private Double longitude;

        public LocationDTO() {}

        public String getContactName() { return contactName; }
        public void setContactName(String contactName) { this.contactName = contactName; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getAddressText() { return addressText; }
        public void setAddressText(String addressText) { this.addressText = addressText; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
        public String getPostalCode() { return postalCode; }
        public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
    }

    public static class CurrentLocationDTO {
        private String locationName;
        private Double latitude;
        private Double longitude;
        private LocalDateTime lastUpdatedAt;

        public CurrentLocationDTO() {}

        public CurrentLocationDTO(String locationName, Double latitude, Double longitude, LocalDateTime lastUpdatedAt) {
            this.locationName = locationName;
            this.latitude = latitude;
            this.longitude = longitude;
            this.lastUpdatedAt = lastUpdatedAt;
        }

        public String getLocationName() { return locationName; }
        public void setLocationName(String locationName) { this.locationName = locationName; }
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
        public LocalDateTime getLastUpdatedAt() { return lastUpdatedAt; }
        public void setLastUpdatedAt(LocalDateTime lastUpdatedAt) { this.lastUpdatedAt = lastUpdatedAt; }
    }

    public static class PackageDTO {
        private String description;
        private Double weight;
        private Integer quantity;

        public PackageDTO() {}

        public PackageDTO(String description, Double weight, Integer quantity) {
            this.description = description;
            this.weight = weight;
            this.quantity = quantity;
        }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Double getWeight() { return weight; }
        public void setWeight(Double weight) { this.weight = weight; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }

    public static class TrackingEventDTO {
        private Long id;
        private String status;
        private String title;
        private String description;
        private String locationName;
        private Double latitude;
        private Double longitude;
        private LocalDateTime eventTime;
        private boolean completed;
        private boolean current;

        public TrackingEventDTO() {}

        public TrackingEventDTO(Long id, String status, String title, String description, String locationName, Double latitude, Double longitude, LocalDateTime eventTime, boolean completed, boolean current) {
            this.id = id;
            this.status = status;
            this.title = title;
            this.description = description;
            this.locationName = locationName;
            this.latitude = latitude;
            this.longitude = longitude;
            this.eventTime = eventTime;
            this.completed = completed;
            this.current = current;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getLocationName() { return locationName; }
        public void setLocationName(String locationName) { this.locationName = locationName; }
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
        public LocalDateTime getEventTime() { return eventTime; }
        public void setEventTime(LocalDateTime eventTime) { this.eventTime = eventTime; }
        public boolean isCompleted() { return completed; }
        public void setCompleted(boolean completed) { this.completed = completed; }
        public boolean isCurrent() { return current; }
        public void setCurrent(boolean current) { this.current = current; }
    }

    public TrackingResponseDTO() {}

    public Long getShipmentId() { return shipmentId; }
    public void setShipmentId(Long shipmentId) { this.shipmentId = shipmentId; }
    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getOperationalStage() { return operationalStage; }
    public void setOperationalStage(String operationalStage) { this.operationalStage = operationalStage; }
    public String getAssignmentStatus() { return assignmentStatus; }
    public void setAssignmentStatus(String assignmentStatus) { this.assignmentStatus = assignmentStatus; }
    public String getAssignedBy() { return assignedBy; }
    public void setAssignedBy(String assignedBy) { this.assignedBy = assignedBy; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }

    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }
    public String getDriverCode() { return driverCode; }
    public void setDriverCode(String driverCode) { this.driverCode = driverCode; }
    public String getDriverPhone() { return driverPhone; }
    public void setDriverPhone(String driverPhone) { this.driverPhone = driverPhone; }
    public String getDriverStatus() { return driverStatus; }
    public void setDriverStatus(String driverStatus) { this.driverStatus = driverStatus; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }
    public String getVehicleModel() { return vehicleModel; }
    public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
    public String getVehicleRegistrationNumber() { return vehicleRegistrationNumber != null ? vehicleRegistrationNumber : vehicleReg; }
    public void setVehicleRegistrationNumber(String vehicleRegistrationNumber) { 
        this.vehicleRegistrationNumber = vehicleRegistrationNumber; 
        this.vehicleReg = vehicleRegistrationNumber;
    }
    public String getVehicleReg() { return vehicleReg != null ? vehicleReg : vehicleRegistrationNumber; }
    public void setVehicleReg(String vehicleReg) { 
        this.vehicleReg = vehicleReg;
        this.vehicleRegistrationNumber = vehicleReg;
    }

    public String getOriginWarehouseName() { return originWarehouseName; }
    public void setOriginWarehouseName(String originWarehouseName) { this.originWarehouseName = originWarehouseName; }
    public String getOriginWarehouseCode() { return originWarehouseCode; }
    public void setOriginWarehouseCode(String originWarehouseCode) { this.originWarehouseCode = originWarehouseCode; }
    public String getWarehouseManagerName() { return warehouseManagerName; }
    public void setWarehouseManagerName(String warehouseManagerName) { this.warehouseManagerName = warehouseManagerName; }
    public String getWarehouseManagerEmail() { return warehouseManagerEmail; }
    public void setWarehouseManagerEmail(String warehouseManagerEmail) { this.warehouseManagerEmail = warehouseManagerEmail; }

    public String getPickupAddress() { return pickupAddress; }
    public void setPickupAddress(String pickupAddress) { this.pickupAddress = pickupAddress; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    public String getOriginName() { return originName; }
    public void setOriginName(String originName) { this.originName = originName; }
    public String getDestinationAddress() { return destinationAddress; }
    public void setDestinationAddress(String destinationAddress) { this.destinationAddress = destinationAddress; }

    public LocationDTO getPickup() { return pickup; }
    public void setPickup(LocationDTO pickup) { this.pickup = pickup; }
    public LocationDTO getDelivery() { return delivery; }
    public void setDelivery(LocationDTO delivery) { this.delivery = delivery; }
    public CurrentLocationDTO getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(CurrentLocationDTO currentLocation) { this.currentLocation = currentLocation; }
    public PackageDTO getPackageDetails() { return packageDetails; }
    public void setPackageDetails(PackageDTO packageDetails) { this.packageDetails = packageDetails; }
    public String getPackageDescription() { return packageDescription; }
    public void setPackageDescription(String packageDescription) { this.packageDescription = packageDescription; }
    public Double getPackageWeight() { return packageWeight; }
    public void setPackageWeight(Double packageWeight) { this.packageWeight = packageWeight; }
    public Integer getPackageQuantity() { return packageQuantity; }
    public void setPackageQuantity(Integer packageQuantity) { this.packageQuantity = packageQuantity; }

    public String getDeliveryType() { return deliveryType; }
    public void setDeliveryType(String deliveryType) { this.deliveryType = deliveryType; }
    public LocalDate getEstimatedDeliveryDate() { return estimatedDeliveryDate; }
    public void setEstimatedDeliveryDate(LocalDate estimatedDeliveryDate) { this.estimatedDeliveryDate = estimatedDeliveryDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getLastUpdatedAt() { return lastUpdatedAt; }
    public void setLastUpdatedAt(LocalDateTime lastUpdatedAt) { 
        this.lastUpdatedAt = lastUpdatedAt;
        this.updatedAt = lastUpdatedAt;
    }
    public LocalDateTime getUpdatedAt() { return updatedAt != null ? updatedAt : lastUpdatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { 
        this.updatedAt = updatedAt;
        this.lastUpdatedAt = updatedAt;
    }

    public ProofOfDeliveryDTO getProofOfDelivery() { return proofOfDelivery; }
    public void setProofOfDelivery(ProofOfDeliveryDTO proofOfDelivery) { this.proofOfDelivery = proofOfDelivery; }

    public List<TrackingEventDTO> getEvents() { return events; }
    public void setEvents(List<TrackingEventDTO> events) { 
        this.events = events;
        this.trackingEvents = events;
    }
    public List<TrackingEventDTO> getTrackingEvents() { return trackingEvents != null ? trackingEvents : events; }
    public void setTrackingEvents(List<TrackingEventDTO> trackingEvents) { 
        this.trackingEvents = trackingEvents;
        this.events = trackingEvents;
    }

    public Double getCurrentLatitude() { return currentLatitude; }
    public void setCurrentLatitude(Double currentLatitude) { this.currentLatitude = currentLatitude; }
    public Double getCurrentLongitude() { return currentLongitude; }
    public void setCurrentLongitude(Double currentLongitude) { this.currentLongitude = currentLongitude; }
    public String getCurrentLocationName() { return currentLocationName; }
    public void setCurrentLocationName(String currentLocationName) { this.currentLocationName = currentLocationName; }
    public LocalDateTime getLastLocationUpdatedAt() { return lastLocationUpdatedAt; }
    public void setLastLocationUpdatedAt(LocalDateTime lastLocationUpdatedAt) { this.lastLocationUpdatedAt = lastLocationUpdatedAt; }
}
`;
fs.writeFileSync(`${base}\\dto\\TrackingResponseDTO.java`, trackingResponseDTOContent, 'utf8');
console.log('Wrote TrackingResponseDTO.java');

// 2. Update ShipmentSummaryDTO.java
const shipmentSummaryDTOContent = `package com.primeroute.logistics.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ShipmentSummaryDTO {

    private Long id;
    private String trackingNumber;
    private String orderNumber;
    private String customerName;
    private String customerEmail;
    private String status;
    private String origin;
    private String destination;
    private String currentLocation;
    private String deliveryType;
    private String driverName;
    private String driverPhone;
    private String vehicleNumber;
    private String vehicleModel;
    private String vehicleType;
    private String originWarehouseName;
    private String originWarehouseCode;
    private String assignmentStatus;
    private String assignedBy;
    private LocalDateTime assignedAt;
    private LocalDate estimatedDeliveryDate;
    private LocalDateTime createdAt;

    public ShipmentSummaryDTO() {}

    public ShipmentSummaryDTO(Long id, String trackingNumber, String orderNumber, String status, String origin, String destination, String currentLocation, String deliveryType, LocalDate estimatedDeliveryDate, LocalDateTime createdAt) {
        this.id = id;
        this.trackingNumber = trackingNumber;
        this.orderNumber = orderNumber;
        this.status = status;
        this.origin = origin;
        this.destination = destination;
        this.currentLocation = currentLocation;
        this.deliveryType = deliveryType;
        this.estimatedDeliveryDate = estimatedDeliveryDate;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public String getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(String currentLocation) { this.currentLocation = currentLocation; }
    public String getDeliveryType() { return deliveryType; }
    public void setDeliveryType(String deliveryType) { this.deliveryType = deliveryType; }
    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }
    public String getDriverPhone() { return driverPhone; }
    public void setDriverPhone(String driverPhone) { this.driverPhone = driverPhone; }
    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }
    public String getVehicleModel() { return vehicleModel; }
    public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
    public String getOriginWarehouseName() { return originWarehouseName; }
    public void setOriginWarehouseName(String originWarehouseName) { this.originWarehouseName = originWarehouseName; }
    public String getOriginWarehouseCode() { return originWarehouseCode; }
    public void setOriginWarehouseCode(String originWarehouseCode) { this.originWarehouseCode = originWarehouseCode; }
    public String getAssignmentStatus() { return assignmentStatus; }
    public void setAssignmentStatus(String assignmentStatus) { this.assignmentStatus = assignmentStatus; }
    public String getAssignedBy() { return assignedBy; }
    public void setAssignedBy(String assignedBy) { this.assignedBy = assignedBy; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }
    public LocalDate getEstimatedDeliveryDate() { return estimatedDeliveryDate; }
    public void setEstimatedDeliveryDate(LocalDate estimatedDeliveryDate) { this.estimatedDeliveryDate = estimatedDeliveryDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
`;
fs.writeFileSync(`${base}\\dto\\ShipmentSummaryDTO.java`, shipmentSummaryDTOContent, 'utf8');
console.log('Wrote ShipmentSummaryDTO.java');

// 3. Update AdminShipmentDTO.java with ProofOfDeliveryDTO
let adminDto = fs.readFileSync(`${base}\\dto\\AdminShipmentDTO.java`, 'utf8');
if (!adminDto.includes('ProofOfDeliveryDTO')) {
  adminDto = adminDto.replace('import java.util.List;', 'import java.util.List;\nimport com.primeroute.logistics.dto.driver.ProofOfDeliveryDTO;');
  adminDto = adminDto.replace('private List<AdminShipmentTrackingEventDTO> events = new ArrayList<>();', 'private ProofOfDeliveryDTO proofOfDelivery;\n    private List<AdminShipmentTrackingEventDTO> events = new ArrayList<>();');
  adminDto = adminDto.replace('public List<AdminShipmentTrackingEventDTO> getEvents()', `public ProofOfDeliveryDTO getProofOfDelivery() { return proofOfDelivery; }
    public void setProofOfDelivery(ProofOfDeliveryDTO proofOfDelivery) { this.proofOfDelivery = proofOfDelivery; }

    public List<AdminShipmentTrackingEventDTO> getEvents()`);
  fs.writeFileSync(`${base}\\dto\\AdminShipmentDTO.java`, adminDto, 'utf8');
  console.log('Updated AdminShipmentDTO.java');
}

// 4. Update WarehouseShipmentDTO.java with ProofOfDeliveryDTO
let whDto = fs.readFileSync(`${base}\\dto\\warehouse\\WarehouseShipmentDTO.java`, 'utf8');
if (!whDto.includes('ProofOfDeliveryDTO')) {
  whDto = whDto.replace('import java.time.LocalDateTime;', 'import java.time.LocalDateTime;\nimport com.primeroute.logistics.dto.driver.ProofOfDeliveryDTO;');
  whDto = whDto.replace('private boolean readyForDispatch;', 'private boolean readyForDispatch;\n    private ProofOfDeliveryDTO proofOfDelivery;');
  whDto = whDto.replace('public boolean isReadyForDispatch()', `public ProofOfDeliveryDTO getProofOfDelivery() { return proofOfDelivery; }
    public void setProofOfDelivery(ProofOfDeliveryDTO proofOfDelivery) { this.proofOfDelivery = proofOfDelivery; }

    public boolean isReadyForDispatch()`);
  fs.writeFileSync(`${base}\\dto\\warehouse\\WarehouseShipmentDTO.java`, whDto, 'utf8');
  console.log('Updated WarehouseShipmentDTO.java');
}
