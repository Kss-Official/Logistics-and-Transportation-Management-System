package com.primeroute.logistics.dto;

import com.primeroute.logistics.entity.DeliveryType;
import com.primeroute.logistics.entity.DriverStatus;
import com.primeroute.logistics.entity.OrderStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class AdminShipmentDTO {

    private Long id;
    private String trackingNumber;

    // Order details
    private Long orderId;
    private String orderNumber;

    // Customer details
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    // Route / Addresses
    private String pickupAddress;
    private String pickupCity;
    private String pickupState;
    private String deliveryAddress;
    private String deliveryCity;
    private String deliveryState;

    private String origin;
    private String destination;

    private DeliveryType deliveryType;
    private OrderStatus status;
    private LocalDate expectedDelivery;
    private String currentLocation;

    // Warehouse details
    private String shipmentNumber;
    private Long warehouseId;
    private String warehouseCode;
    private String warehouseName;
    private String warehouseManagerName;
    private String warehouseManagerEmail;

    // Origin Warehouse
    private Long originWarehouseId;
    private String originWarehouseCode;
    private String originWarehouseName;
    private String originWarehouseManagerName;
    private String originWarehouseManagerEmail;

    // Destination Warehouse
    private Long destinationWarehouseId;
    private String destinationWarehouseCode;
    private String destinationWarehouseName;

    // Assignment Audit
    private String assignmentStatus;
    private String assignedBy;
    private LocalDateTime assignedAt;

    // Driver details
    private Long driverId;
    private String assignedDriver;
    private String driverPhone;
    private DriverStatus driverStatus;

    // Vehicle details
    private Long vehicleId;
    private String vehicleNumber;
    private String vehicleModel;
    private String vehicleType;
    private String vehicleRegistrationNumber;
    private String assignedVehicle;

    // Package details (derived from Order)
    private String packageDescription;
    private Double packageWeight;
    private Integer packageQuantity;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Milestone tracking events
    private List<AdminShipmentTrackingEventDTO> events = new ArrayList<>();

    public AdminShipmentDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getPickupAddress() { return pickupAddress; }
    public void setPickupAddress(String pickupAddress) { this.pickupAddress = pickupAddress; }

    public String getPickupCity() { return pickupCity; }
    public void setPickupCity(String pickupCity) { this.pickupCity = pickupCity; }

    public String getPickupState() { return pickupState; }
    public void setPickupState(String pickupState) { this.pickupState = pickupState; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public String getDeliveryCity() { return deliveryCity; }
    public void setDeliveryCity(String deliveryCity) { this.deliveryCity = deliveryCity; }

    public String getDeliveryState() { return deliveryState; }
    public void setDeliveryState(String deliveryState) { this.deliveryState = deliveryState; }

    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public DeliveryType getDeliveryType() { return deliveryType; }
    public void setDeliveryType(DeliveryType deliveryType) { this.deliveryType = deliveryType; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public LocalDate getExpectedDelivery() { return expectedDelivery; }
    public void setExpectedDelivery(LocalDate expectedDelivery) { this.expectedDelivery = expectedDelivery; }

    public String getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(String currentLocation) { this.currentLocation = currentLocation; }

    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }

    public String getAssignedDriver() { return assignedDriver; }
    public void setAssignedDriver(String assignedDriver) { this.assignedDriver = assignedDriver; }

    public String getDriverPhone() { return driverPhone; }
    public void setDriverPhone(String driverPhone) { this.driverPhone = driverPhone; }

    public DriverStatus getDriverStatus() { return driverStatus; }
    public void setDriverStatus(DriverStatus driverStatus) { this.driverStatus = driverStatus; }

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public String getVehicleModel() { return vehicleModel; }
    public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getVehicleRegistrationNumber() { return vehicleRegistrationNumber; }
    public void setVehicleRegistrationNumber(String vehicleRegistrationNumber) { this.vehicleRegistrationNumber = vehicleRegistrationNumber; }

    public String getAssignedVehicle() { return assignedVehicle; }
    public void setAssignedVehicle(String assignedVehicle) { this.assignedVehicle = assignedVehicle; }

    public String getPackageDescription() { return packageDescription; }
    public void setPackageDescription(String packageDescription) { this.packageDescription = packageDescription; }

    public Double getPackageWeight() { return packageWeight; }
    public void setPackageWeight(Double packageWeight) { this.packageWeight = packageWeight; }

    public Integer getPackageQuantity() { return packageQuantity; }
    public void setPackageQuantity(Integer packageQuantity) { this.packageQuantity = packageQuantity; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getShipmentNumber() { return shipmentNumber != null ? shipmentNumber : trackingNumber; }
    public void setShipmentNumber(String shipmentNumber) { this.shipmentNumber = shipmentNumber; }

    public Long getWarehouseId() { return warehouseId != null ? warehouseId : originWarehouseId; }
    public void setWarehouseId(Long warehouseId) {
        this.warehouseId = warehouseId;
        this.originWarehouseId = warehouseId;
    }

    public String getWarehouseCode() { return warehouseCode != null ? warehouseCode : originWarehouseCode; }
    public void setWarehouseCode(String warehouseCode) {
        this.warehouseCode = warehouseCode;
        this.originWarehouseCode = warehouseCode;
    }

    public String getWarehouseName() { return warehouseName != null ? warehouseName : originWarehouseName; }
    public void setWarehouseName(String warehouseName) {
        this.warehouseName = warehouseName;
        this.originWarehouseName = warehouseName;
    }

    public String getWarehouseManagerName() { return warehouseManagerName != null ? warehouseManagerName : originWarehouseManagerName; }
    public void setWarehouseManagerName(String warehouseManagerName) {
        this.warehouseManagerName = warehouseManagerName;
        this.originWarehouseManagerName = warehouseManagerName;
    }

    public String getWarehouseManagerEmail() { return warehouseManagerEmail != null ? warehouseManagerEmail : originWarehouseManagerEmail; }
    public void setWarehouseManagerEmail(String warehouseManagerEmail) {
        this.warehouseManagerEmail = warehouseManagerEmail;
        this.originWarehouseManagerEmail = warehouseManagerEmail;
    }

    public Long getOriginWarehouseId() { return originWarehouseId; }
    public void setOriginWarehouseId(Long originWarehouseId) {
        this.originWarehouseId = originWarehouseId;
        this.warehouseId = originWarehouseId;
    }

    public String getOriginWarehouseCode() { return originWarehouseCode; }
    public void setOriginWarehouseCode(String originWarehouseCode) {
        this.originWarehouseCode = originWarehouseCode;
        this.warehouseCode = originWarehouseCode;
    }

    public String getOriginWarehouseName() { return originWarehouseName; }
    public void setOriginWarehouseName(String originWarehouseName) {
        this.originWarehouseName = originWarehouseName;
        this.warehouseName = originWarehouseName;
    }

    public String getOriginWarehouseManagerName() { return originWarehouseManagerName; }
    public void setOriginWarehouseManagerName(String originWarehouseManagerName) {
        this.originWarehouseManagerName = originWarehouseManagerName;
        this.warehouseManagerName = originWarehouseManagerName;
    }

    public String getOriginWarehouseManagerEmail() { return originWarehouseManagerEmail; }
    public void setOriginWarehouseManagerEmail(String originWarehouseManagerEmail) {
        this.originWarehouseManagerEmail = originWarehouseManagerEmail;
        this.warehouseManagerEmail = originWarehouseManagerEmail;
    }

    public Long getDestinationWarehouseId() { return destinationWarehouseId; }
    public void setDestinationWarehouseId(Long destinationWarehouseId) { this.destinationWarehouseId = destinationWarehouseId; }

    public String getDestinationWarehouseCode() { return destinationWarehouseCode; }
    public void setDestinationWarehouseCode(String destinationWarehouseCode) { this.destinationWarehouseCode = destinationWarehouseCode; }

    public String getDestinationWarehouseName() { return destinationWarehouseName; }
    public void setDestinationWarehouseName(String destinationWarehouseName) { this.destinationWarehouseName = destinationWarehouseName; }

    public String getAssignmentStatus() { return assignmentStatus; }
    public void setAssignmentStatus(String assignmentStatus) { this.assignmentStatus = assignmentStatus; }

    public String getAssignedBy() { return assignedBy; }
    public void setAssignedBy(String assignedBy) { this.assignedBy = assignedBy; }

    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }

    public List<AdminShipmentTrackingEventDTO> getEvents() { return events; }
    public void setEvents(List<AdminShipmentTrackingEventDTO> events) { this.events = events; }
}
