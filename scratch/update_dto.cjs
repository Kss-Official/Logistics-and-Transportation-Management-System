const fs = require('fs');
const path = require('path');

const backendDir = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management';
const file = path.join(backendDir, 'src/main/java/com/primeroute/logistics/dto/driver/DriverDeliveryDTO.java');

const content = `package com.primeroute.logistics.dto.driver;

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
    private Double currentLatitude;
    private Double currentLongitude;
    private String currentLocationName;
    private String lastLocationUpdatedAt;

    // Financial & Cash on Delivery (COD) fields
    private String paymentMethod;
    private String paymentStatus;
    private Double totalAmount;
    private Double codAmount;
    private Boolean isCod;
    private Boolean codCollected;

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

    public Double getCurrentLatitude() { return currentLatitude; }
    public void setCurrentLatitude(Double currentLatitude) { this.currentLatitude = currentLatitude; }

    public Double getCurrentLongitude() { return currentLongitude; }
    public void setCurrentLongitude(Double currentLongitude) { this.currentLongitude = currentLongitude; }

    public String getCurrentLocationName() { return currentLocationName; }
    public void setCurrentLocationName(String currentLocationName) { this.currentLocationName = currentLocationName; }

    public String getLastLocationUpdatedAt() { return lastLocationUpdatedAt; }
    public void setLastLocationUpdatedAt(String lastLocationUpdatedAt) { this.lastLocationUpdatedAt = lastLocationUpdatedAt; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public Double getCodAmount() { return codAmount; }
    public void setCodAmount(Double codAmount) { this.codAmount = codAmount; }

    public Boolean getIsCod() { return isCod != null && isCod; }
    public void setIsCod(Boolean isCod) { this.isCod = isCod; }

    public Boolean getCodCollected() { return codCollected != null && codCollected; }
    public void setCodCollected(Boolean codCollected) { this.codCollected = codCollected; }
}
`;

fs.writeFileSync(file, content, 'utf8');
console.log('Updated DriverDeliveryDTO.java');
