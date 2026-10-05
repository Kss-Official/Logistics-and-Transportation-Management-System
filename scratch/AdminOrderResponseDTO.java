package com.primeroute.logistics.dto;

import com.primeroute.logistics.entity.DeliveryType;
import com.primeroute.logistics.entity.OrderStatus;

import java.time.LocalDateTime;

public class AdminOrderResponseDTO {

    private Long id;
    private String orderNumber;
    private String trackingNumber;

    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    private Long pickupAddressId;
    private String pickupAddress;
    private String pickupCity;
    private String pickupState;

    private Long deliveryAddressId;
    private String deliveryAddress;
    private String deliveryCity;
    private String deliveryState;

    // Origin / Fulfillment Warehouse details
    private Long originWarehouseId;
    private String originWarehouseCode;
    private String originWarehouseName;
    private String originWarehouseManagerName;
    private String originWarehouseManagerEmail;

    // Destination Warehouse details
    private Long destinationWarehouseId;
    private String destinationWarehouseCode;
    private String destinationWarehouseName;

    // Backward compatible aliases
    private Long warehouseId;
    private String warehouseCode;
    private String warehouseName;
    private String warehouseManagerName;
    private String warehouseManagerEmail;

    private String packageDescription;
    private Double packageWeight;
    private Integer packageQuantity;

    private DeliveryType deliveryType;
    private OrderStatus status;

    private Double baseFee;
    private Double weightCharge;
    private Double prioritySurcharge;
    private Double subtotal;
    private Double taxAmount;
    private Double totalAmount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AdminOrderResponseDTO() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public Long getPickupAddressId() { return pickupAddressId; }
    public void setPickupAddressId(Long pickupAddressId) { this.pickupAddressId = pickupAddressId; }

    public String getPickupAddress() { return pickupAddress; }
    public void setPickupAddress(String pickupAddress) { this.pickupAddress = pickupAddress; }

    public String getPickupCity() { return pickupCity; }
    public void setPickupCity(String pickupCity) { this.pickupCity = pickupCity; }

    public String getPickupState() { return pickupState; }
    public void setPickupState(String pickupState) { this.pickupState = pickupState; }

    public Long getDeliveryAddressId() { return deliveryAddressId; }
    public void setDeliveryAddressId(Long deliveryAddressId) { this.deliveryAddressId = deliveryAddressId; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public String getDeliveryCity() { return deliveryCity; }
    public void setDeliveryCity(String deliveryCity) { this.deliveryCity = deliveryCity; }

    public String getDeliveryState() { return deliveryState; }
    public void setDeliveryState(String deliveryState) { this.deliveryState = deliveryState; }

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

    public Long getWarehouseId() { return warehouseId != null ? warehouseId : originWarehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }

    public String getWarehouseCode() { return warehouseCode != null ? warehouseCode : originWarehouseCode; }
    public void setWarehouseCode(String warehouseCode) { this.warehouseCode = warehouseCode; }

    public String getWarehouseName() { return warehouseName != null ? warehouseName : originWarehouseName; }
    public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }

    public String getWarehouseManagerName() { return warehouseManagerName != null ? warehouseManagerName : originWarehouseManagerName; }
    public void setWarehouseManagerName(String warehouseManagerName) { this.warehouseManagerName = warehouseManagerName; }

    public String getWarehouseManagerEmail() { return warehouseManagerEmail != null ? warehouseManagerEmail : originWarehouseManagerEmail; }
    public void setWarehouseManagerEmail(String warehouseManagerEmail) { this.warehouseManagerEmail = warehouseManagerEmail; }

    public String getPackageDescription() { return packageDescription; }
    public void setPackageDescription(String packageDescription) { this.packageDescription = packageDescription; }

    public Double getPackageWeight() { return packageWeight; }
    public void setPackageWeight(Double packageWeight) { this.packageWeight = packageWeight; }

    public Integer getPackageQuantity() { return packageQuantity; }
    public void setPackageQuantity(Integer packageQuantity) { this.packageQuantity = packageQuantity; }

    public DeliveryType getDeliveryType() { return deliveryType; }
    public void setDeliveryType(DeliveryType deliveryType) { this.deliveryType = deliveryType; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public Double getBaseFee() { return baseFee; }
    public void setBaseFee(Double baseFee) { this.baseFee = baseFee; }

    public Double getWeightCharge() { return weightCharge; }
    public void setWeightCharge(Double weightCharge) { this.weightCharge = weightCharge; }

    public Double getPrioritySurcharge() { return prioritySurcharge; }
    public void setPrioritySurcharge(Double prioritySurcharge) { this.prioritySurcharge = prioritySurcharge; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }

    public Double getTaxAmount() { return taxAmount; }
    public void setTaxAmount(Double taxAmount) { this.taxAmount = taxAmount; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
