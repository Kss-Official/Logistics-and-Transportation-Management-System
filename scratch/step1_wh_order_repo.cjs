const fs = require('fs');
const path = require('path');

const basePath = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

// 1. Create WarehouseOrderDTO.java
const warehouseOrderDtoContent = `package com.primeroute.logistics.dto.warehouse;

import com.primeroute.logistics.dto.OrderItemDTO;
import java.time.LocalDateTime;
import java.util.List;

public class WarehouseOrderDTO {

    private Long id;
    private String orderNumber;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    private String pickupAddress;
    private String pickupCity;
    private String pickupState;
    private String pickupPostalCode;

    private String deliveryAddress;
    private String deliveryCity;
    private String deliveryState;
    private String deliveryPostalCode;

    private String deliveryType;
    private String packageDescription;
    private Integer packageQuantity;
    private Double packageWeight;

    private Double subtotal;
    private Double prioritySurcharge;
    private Double taxAmount;
    private Double totalAmount;

    private String status;
    private String operationalStage;
    private String trackingNumber;
    private Long shipmentId;

    private Long originWarehouseId;
    private String originWarehouseName;
    private String originWarehouseCode;

    private String driverName;
    private String vehicleNumber;

    private boolean canStartProcessing;
    private boolean canMarkPacked;
    private boolean canReadyForDispatch;

    private List<OrderItemDTO> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public WarehouseOrderDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public String getPickupPostalCode() { return pickupPostalCode; }
    public void setPickupPostalCode(String pickupPostalCode) { this.pickupPostalCode = pickupPostalCode; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public String getDeliveryCity() { return deliveryCity; }
    public void setDeliveryCity(String deliveryCity) { this.deliveryCity = deliveryCity; }

    public String getDeliveryState() { return deliveryState; }
    public void setDeliveryState(String deliveryState) { this.deliveryState = deliveryState; }

    public String getDeliveryPostalCode() { return deliveryPostalCode; }
    public void setDeliveryPostalCode(String deliveryPostalCode) { this.deliveryPostalCode = deliveryPostalCode; }

    public String getDeliveryType() { return deliveryType; }
    public void setDeliveryType(String deliveryType) { this.deliveryType = deliveryType; }

    public String getPackageDescription() { return packageDescription; }
    public void setPackageDescription(String packageDescription) { this.packageDescription = packageDescription; }

    public Integer getPackageQuantity() { return packageQuantity; }
    public void setPackageQuantity(Integer packageQuantity) { this.packageQuantity = packageQuantity; }

    public Double getPackageWeight() { return packageWeight; }
    public void setPackageWeight(Double packageWeight) { this.packageWeight = packageWeight; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }

    public Double getPrioritySurcharge() { return prioritySurcharge; }
    public void setPrioritySurcharge(Double prioritySurcharge) { this.prioritySurcharge = prioritySurcharge; }

    public Double getTaxAmount() { return taxAmount; }
    public void setTaxAmount(Double taxAmount) { this.taxAmount = taxAmount; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getOperationalStage() { return operationalStage; }
    public void setOperationalStage(String operationalStage) { this.operationalStage = operationalStage; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public Long getShipmentId() { return shipmentId; }
    public void setShipmentId(Long shipmentId) { this.shipmentId = shipmentId; }

    public Long getOriginWarehouseId() { return originWarehouseId; }
    public void setOriginWarehouseId(Long originWarehouseId) { this.originWarehouseId = originWarehouseId; }

    public String getOriginWarehouseName() { return originWarehouseName; }
    public void setOriginWarehouseName(String originWarehouseName) { this.originWarehouseName = originWarehouseName; }

    public String getOriginWarehouseCode() { return originWarehouseCode; }
    public void setOriginWarehouseCode(String originWarehouseCode) { this.originWarehouseCode = originWarehouseCode; }

    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public boolean isCanStartProcessing() { return canStartProcessing; }
    public void setCanStartProcessing(boolean canStartProcessing) { this.canStartProcessing = canStartProcessing; }

    public boolean isCanMarkPacked() { return canMarkPacked; }
    public void setCanMarkPacked(boolean canMarkPacked) { this.canMarkPacked = canMarkPacked; }

    public boolean isCanReadyForDispatch() { return canReadyForDispatch; }
    public void setCanReadyForDispatch(boolean canReadyForDispatch) { this.canReadyForDispatch = canReadyForDispatch; }

    public List<OrderItemDTO> getItems() { return items; }
    public void setItems(List<OrderItemDTO> items) { this.items = items; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
`;

fs.writeFileSync(path.join(basePath, "dto/warehouse/WarehouseOrderDTO.java"), warehouseOrderDtoContent, 'utf8');
console.log("Created WarehouseOrderDTO.java");

// 2. Update OrderRepository.java to include findByOriginWarehouseOrderByCreatedAtDesc
const orderRepoPath = path.join(basePath, "repository/OrderRepository.java");
let orderRepoContent = fs.readFileSync(orderRepoPath, 'utf8');
if (!orderRepoContent.includes("findByOriginWarehouseOrderByCreatedAtDesc")) {
  const insertIndex = orderRepoContent.lastIndexOf("}");
  const methodsToAdd = `
    List<Order> findByOriginWarehouseOrderByCreatedAtDesc(com.primeroute.logistics.entity.Warehouse originWarehouse);

    List<Order> findByOriginWarehouse(com.primeroute.logistics.entity.Warehouse originWarehouse);

    java.util.Optional<Order> findByIdAndOriginWarehouse(Long id, com.primeroute.logistics.entity.Warehouse originWarehouse);
`;
  orderRepoContent = orderRepoContent.substring(0, insertIndex) + methodsToAdd + "\n}\n";
  fs.writeFileSync(orderRepoPath, orderRepoContent, 'utf8');
  console.log("Updated OrderRepository.java");
}
