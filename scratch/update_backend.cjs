const fs = require('fs');

const trackingDtoContent = `package com.primeroute.logistics.dto;

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

    // Driver details
    private String driverName;
    private String driverCode;
    private String driverPhone;

    // Vehicle details
    private String vehicleNumber;
    private String vehicleModel;
    private String vehicleType;

    // Origin Warehouse
    private String originWarehouseName;
    private String originWarehouseCode;
    private String warehouseManagerName;
    private String warehouseManagerEmail;

    // Addresses
    private String pickupAddress;
    private String deliveryAddress;
    private String originName;
    private String destinationAddress;

    // Structured Location & Package info
    private LocationDTO pickup;
    private LocationDTO delivery;
    private CurrentLocationDTO currentLocation;
    private PackageDTO packageDetails;
    private String packageDescription;
    private Double packageWeight;
    private Integer packageQuantity;

    // Delivery & Schedule
    private String deliveryType;
    private LocalDate estimatedDeliveryDate;

    // Real GPS telemetry
    private Double currentLatitude;
    private Double currentLongitude;
    private String currentLocationName;
    private LocalDateTime lastLocationUpdatedAt;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdatedAt;
    private LocalDateTime updatedAt;

    // Milestones
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

        public LocationDTO(String contactName, String phone, String addressText, String city, String state, String postalCode, String country, Double latitude, Double longitude) {
            this.contactName = contactName;
            this.phone = phone;
            this.addressText = addressText;
            this.city = city;
            this.state = state;
            this.postalCode = postalCode;
            this.country = country;
            this.latitude = latitude;
            this.longitude = longitude;
        }

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

    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }
    public String getDriverCode() { return driverCode; }
    public void setDriverCode(String driverCode) { this.driverCode = driverCode; }
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

fs.writeFileSync('C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/dto/TrackingResponseDTO.java', trackingDtoContent, 'utf8');
console.log('Successfully updated TrackingResponseDTO.java');
