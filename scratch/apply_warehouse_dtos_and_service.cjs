const fs = require('fs');
const path = require('path');

const BASE_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

function writeFile(relPath, content) {
  const fullPath = path.join(BASE_DIR, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Wrote: ' + relPath);
}

// 1. WarehouseDashboardDTO.java
writeFile('dto/warehouse/WarehouseDashboardDTO.java', `
package com.primeroute.logistics.dto.warehouse;

import java.util.List;

public class WarehouseDashboardDTO {

    // Warehouse info
    private Long warehouseId;
    private String warehouseCode;
    private String warehouseName;
    private String warehouseType;
    private String managerName;
    private String managerEmail;
    private String city;
    private String state;
    private Double totalCapacity;
    private Double occupiedCapacity;
    private Double availableCapacity;
    private Double utilizationRate;
    private String status;
    private String operatingHours;

    // Inventory KPIs
    private long totalInventoryItems;
    private long availableStock;
    private long reservedStock;
    private long damagedStock;
    private long lowStockCount;

    // Shipment KPIs
    private long incomingShipmentsCount;
    private long outgoingShipmentsCount;
    private long readyForDispatchCount;

    // Fleet KPIs
    private long driversAvailableCount;
    private long driversTotalCount;
    private long vehiclesAvailableCount;
    private long vehiclesTotalCount;

    // Previews / Recent Activity
    private List<WarehouseActivityDTO> recentActivities;
    private List<WarehouseInventoryDTO> lowStockAlerts;
    private List<WarehouseShipmentDTO> incomingPreview;
    private List<WarehouseShipmentDTO> outgoingPreview;

    public WarehouseDashboardDTO() {}

    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }

    public String getWarehouseCode() { return warehouseCode; }
    public void setWarehouseCode(String warehouseCode) { this.warehouseCode = warehouseCode; }

    public String getWarehouseName() { return warehouseName; }
    public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }

    public String getWarehouseType() { return warehouseType; }
    public void setWarehouseType(String warehouseType) { this.warehouseType = warehouseType; }

    public String getManagerName() { return managerName; }
    public void setManagerName(String managerName) { this.managerName = managerName; }

    public String getManagerEmail() { return managerEmail; }
    public void setManagerEmail(String managerEmail) { this.managerEmail = managerEmail; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public Double getTotalCapacity() { return totalCapacity; }
    public void setTotalCapacity(Double totalCapacity) { this.totalCapacity = totalCapacity; }

    public Double getOccupiedCapacity() { return occupiedCapacity; }
    public void setOccupiedCapacity(Double occupiedCapacity) { this.occupiedCapacity = occupiedCapacity; }

    public Double getAvailableCapacity() { return availableCapacity; }
    public void setAvailableCapacity(Double availableCapacity) { this.availableCapacity = availableCapacity; }

    public Double getUtilizationRate() { return utilizationRate; }
    public void setUtilizationRate(Double utilizationRate) { this.utilizationRate = utilizationRate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getOperatingHours() { return operatingHours; }
    public void setOperatingHours(String operatingHours) { this.operatingHours = operatingHours; }

    public long getTotalInventoryItems() { return totalInventoryItems; }
    public void setTotalInventoryItems(long totalInventoryItems) { this.totalInventoryItems = totalInventoryItems; }

    public long getAvailableStock() { return availableStock; }
    public void setAvailableStock(long availableStock) { this.availableStock = availableStock; }

    public long getReservedStock() { return reservedStock; }
    public void setReservedStock(long reservedStock) { this.reservedStock = reservedStock; }

    public long getDamagedStock() { return damagedStock; }
    public void setDamagedStock(long damagedStock) { this.damagedStock = damagedStock; }

    public long getLowStockCount() { return lowStockCount; }
    public void setLowStockCount(long lowStockCount) { this.lowStockCount = lowStockCount; }

    public long getIncomingShipmentsCount() { return incomingShipmentsCount; }
    public void setIncomingShipmentsCount(long incomingShipmentsCount) { this.incomingShipmentsCount = incomingShipmentsCount; }

    public long getOutgoingShipmentsCount() { return outgoingShipmentsCount; }
    public void setOutgoingShipmentsCount(long outgoingShipmentsCount) { this.outgoingShipmentsCount = outgoingShipmentsCount; }

    public long getReadyForDispatchCount() { return readyForDispatchCount; }
    public void setReadyForDispatchCount(long readyForDispatchCount) { this.readyForDispatchCount = readyForDispatchCount; }

    public long getDriversAvailableCount() { return driversAvailableCount; }
    public void setDriversAvailableCount(long driversAvailableCount) { this.driversAvailableCount = driversAvailableCount; }

    public long getDriversTotalCount() { return driversTotalCount; }
    public void setDriversTotalCount(long driversTotalCount) { this.driversTotalCount = driversTotalCount; }

    public long getVehiclesAvailableCount() { return vehiclesAvailableCount; }
    public void setVehiclesAvailableCount(long vehiclesAvailableCount) { this.vehiclesAvailableCount = vehiclesAvailableCount; }

    public long getVehiclesTotalCount() { return vehiclesTotalCount; }
    public void setVehiclesTotalCount(long vehiclesTotalCount) { this.vehiclesTotalCount = vehiclesTotalCount; }

    public List<WarehouseActivityDTO> getRecentActivities() { return recentActivities; }
    public void setRecentActivities(List<WarehouseActivityDTO> recentActivities) { this.recentActivities = recentActivities; }

    public List<WarehouseInventoryDTO> getLowStockAlerts() { return lowStockAlerts; }
    public void setLowStockAlerts(List<WarehouseInventoryDTO> lowStockAlerts) { this.lowStockAlerts = lowStockAlerts; }

    public List<WarehouseShipmentDTO> getIncomingPreview() { return incomingPreview; }
    public void setIncomingPreview(List<WarehouseShipmentDTO> incomingPreview) { this.incomingPreview = incomingPreview; }

    public List<WarehouseShipmentDTO> getOutgoingPreview() { return outgoingPreview; }
    public void setOutgoingPreview(List<WarehouseShipmentDTO> outgoingPreview) { this.outgoingPreview = outgoingPreview; }
}
`);

// 2. WarehouseActivityDTO.java
writeFile('dto/warehouse/WarehouseActivityDTO.java', `
package com.primeroute.logistics.dto.warehouse;

import java.time.LocalDateTime;

public class WarehouseActivityDTO {

    private String who;
    private String what;
    private String where;
    private String whenFormatted;
    private LocalDateTime timestamp;
    private String type;
    private String reference;

    public WarehouseActivityDTO() {}

    public WarehouseActivityDTO(String who, String what, String where, String whenFormatted, LocalDateTime timestamp, String type, String reference) {
        this.who = who;
        this.what = what;
        this.where = where;
        this.whenFormatted = whenFormatted;
        this.timestamp = timestamp;
        this.type = type;
        this.reference = reference;
    }

    public String getWho() { return who; }
    public void setWho(String who) { this.who = who; }

    public String getWhat() { return what; }
    public void setWhat(String what) { this.what = what; }

    public String getWhere() { return where; }
    public void setWhere(String where) { this.where = where; }

    public String getWhenFormatted() { return whenFormatted; }
    public void setWhenFormatted(String whenFormatted) { this.whenFormatted = whenFormatted; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
}
`);

// 3. WarehouseInventoryDTO.java
writeFile('dto/warehouse/WarehouseInventoryDTO.java', `
package com.primeroute.logistics.dto.warehouse;

import java.time.LocalDateTime;

public class WarehouseInventoryDTO {

    private Long id;
    private String sku;
    private String productName;
    private String category;
    private Integer totalStock;
    private Integer availableStock;
    private Integer reservedStock;
    private Integer damagedStock;
    private Integer reorderLevel;
    private Double unitPrice;
    private String unit;
    private String status;
    private LocalDateTime updatedAt;

    public WarehouseInventoryDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getTotalStock() { return totalStock; }
    public void setTotalStock(Integer totalStock) { this.totalStock = totalStock; }

    public Integer getAvailableStock() { return availableStock; }
    public void setAvailableStock(Integer availableStock) { this.availableStock = availableStock; }

    public Integer getReservedStock() { return reservedStock; }
    public void setReservedStock(Integer reservedStock) { this.reservedStock = reservedStock; }

    public Integer getDamagedStock() { return damagedStock; }
    public void setDamagedStock(Integer damagedStock) { this.damagedStock = damagedStock; }

    public Integer getReorderLevel() { return reorderLevel; }
    public void setReorderLevel(Integer reorderLevel) { this.reorderLevel = reorderLevel; }

    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
`);

// 4. WarehouseTransactionDTO.java
writeFile('dto/warehouse/WarehouseTransactionDTO.java', `
package com.primeroute.logistics.dto.warehouse;

import java.time.LocalDateTime;

public class WarehouseTransactionDTO {

    private Long id;
    private String sku;
    private String productName;
    private String transactionType;
    private Integer quantity;
    private Integer previousAvailable;
    private Integer newAvailable;
    private String performedBy;
    private LocalDateTime timestamp;
    private String reason;
    private String referenceOrder;
    private String referenceShipment;

    public WarehouseTransactionDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Integer getPreviousAvailable() { return previousAvailable; }
    public void setPreviousAvailable(Integer previousAvailable) { this.previousAvailable = previousAvailable; }

    public Integer getNewAvailable() { return newAvailable; }
    public void setNewAvailable(Integer newAvailable) { this.newAvailable = newAvailable; }

    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getReferenceOrder() { return referenceOrder; }
    public void setReferenceOrder(String referenceOrder) { this.referenceOrder = referenceOrder; }

    public String getReferenceShipment() { return referenceShipment; }
    public void setReferenceShipment(String referenceShipment) { this.referenceShipment = referenceShipment; }
}
`);

// 5. WarehouseShipmentDTO.java
writeFile('dto/warehouse/WarehouseShipmentDTO.java', `
package com.primeroute.logistics.dto.warehouse;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class WarehouseShipmentDTO {

    private Long id;
    private String trackingNumber;
    private Long orderId;
    private String orderNumber;
    private String status;
    private String operationalStage;

    // Origin
    private Long originWarehouseId;
    private String originWarehouseName;
    private String originCity;
    private String pickupAddress;

    // Destination
    private Long destinationWarehouseId;
    private String destinationWarehouseName;
    private String destinationCity;
    private String deliveryAddress;

    // Package
    private String packageDescription;
    private Double packageWeight;
    private Integer packageQuantity;

    // Driver
    private Long driverId;
    private String driverName;
    private String driverPhone;
    private String driverStatus;

    // Vehicle
    private Long vehicleId;
    private String vehicleNumber;
    private String vehicleType;
    private String vehicleModel;
    private String vehicleStatus;

    // Timing & Location
    private LocalDate estimatedDeliveryDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Double currentLatitude;
    private Double currentLongitude;
    private String currentLocationName;

    // Readiness
    private boolean readyForDispatch;

    public WarehouseShipmentDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getOperationalStage() { return operationalStage; }
    public void setOperationalStage(String operationalStage) { this.operationalStage = operationalStage; }

    public Long getOriginWarehouseId() { return originWarehouseId; }
    public void setOriginWarehouseId(Long originWarehouseId) { this.originWarehouseId = originWarehouseId; }

    public String getOriginWarehouseName() { return originWarehouseName; }
    public void setOriginWarehouseName(String originWarehouseName) { this.originWarehouseName = originWarehouseName; }

    public String getOriginCity() { return originCity; }
    public void setOriginCity(String originCity) { this.originCity = originCity; }

    public String getPickupAddress() { return pickupAddress; }
    public void setPickupAddress(String pickupAddress) { this.pickupAddress = pickupAddress; }

    public Long getDestinationWarehouseId() { return destinationWarehouseId; }
    public void setDestinationWarehouseId(Long destinationWarehouseId) { this.destinationWarehouseId = destinationWarehouseId; }

    public String getDestinationWarehouseName() { return destinationWarehouseName; }
    public void setDestinationWarehouseName(String destinationWarehouseName) { this.destinationWarehouseName = destinationWarehouseName; }

    public String getDestinationCity() { return destinationCity; }
    public void setDestinationCity(String destinationCity) { this.destinationCity = destinationCity; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public String getPackageDescription() { return packageDescription; }
    public void setPackageDescription(String packageDescription) { this.packageDescription = packageDescription; }

    public Double getPackageWeight() { return packageWeight; }
    public void setPackageWeight(Double packageWeight) { this.packageWeight = packageWeight; }

    public Integer getPackageQuantity() { return packageQuantity; }
    public void setPackageQuantity(Integer packageQuantity) { this.packageQuantity = packageQuantity; }

    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }

    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }

    public String getDriverPhone() { return driverPhone; }
    public void setDriverPhone(String driverPhone) { this.driverPhone = driverPhone; }

    public String getDriverStatus() { return driverStatus; }
    public void setDriverStatus(String driverStatus) { this.driverStatus = driverStatus; }

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getVehicleModel() { return vehicleModel; }
    public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }

    public String getVehicleStatus() { return vehicleStatus; }
    public void setVehicleStatus(String vehicleStatus) { this.vehicleStatus = vehicleStatus; }

    public LocalDate getEstimatedDeliveryDate() { return estimatedDeliveryDate; }
    public void setEstimatedDeliveryDate(LocalDate estimatedDeliveryDate) { this.estimatedDeliveryDate = estimatedDeliveryDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Double getCurrentLatitude() { return currentLatitude; }
    public void setCurrentLatitude(Double currentLatitude) { this.currentLatitude = currentLatitude; }

    public Double getCurrentLongitude() { return currentLongitude; }
    public void setCurrentLongitude(Double currentLongitude) { this.currentLongitude = currentLongitude; }

    public String getCurrentLocationName() { return currentLocationName; }
    public void setCurrentLocationName(String currentLocationName) { this.currentLocationName = currentLocationName; }

    public boolean isReadyForDispatch() { return readyForDispatch; }
    public void setReadyForDispatch(boolean readyForDispatch) { this.readyForDispatch = readyForDispatch; }
}
`);

// 6. Request DTOs
writeFile('dto/warehouse/ReceiveStockRequest.java', `
package com.primeroute.logistics.dto.warehouse;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ReceiveStockRequest {

    @NotBlank(message = "SKU is required")
    private String sku;

    private String productName;
    private String category;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private String reason;
    private String referenceNumber;
    private Double unitPrice;
    private String unit;
    private Integer reorderLevel;

    public ReceiveStockRequest() {}

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }

    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public Integer getReorderLevel() { return reorderLevel; }
    public void setReorderLevel(Integer reorderLevel) { this.reorderLevel = reorderLevel; }
}
`);

writeFile('dto/warehouse/AdjustStockRequest.java', `
package com.primeroute.logistics.dto.warehouse;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AdjustStockRequest {

    @NotBlank(message = "SKU is required")
    private String sku;

    @NotNull(message = "New total stock quantity is required")
    @Min(value = 0, message = "Total stock cannot be negative")
    private Integer newTotalStock;

    @NotBlank(message = "Reason for adjustment is mandatory")
    private String reason;

    public AdjustStockRequest() {}

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public Integer getNewTotalStock() { return newTotalStock; }
    public void setNewTotalStock(Integer newTotalStock) { this.newTotalStock = newTotalStock; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
`);

writeFile('dto/warehouse/ReserveStockRequest.java', `
package com.primeroute.logistics.dto.warehouse;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ReserveStockRequest {

    @NotBlank(message = "SKU is required")
    private String sku;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private String referenceOrder;
    private String reason;

    public ReserveStockRequest() {}

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getReferenceOrder() { return referenceOrder; }
    public void setReferenceOrder(String referenceOrder) { this.referenceOrder = referenceOrder; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
`);

writeFile('dto/warehouse/AssignFleetRequest.java', `
package com.primeroute.logistics.dto.warehouse;

public class AssignFleetRequest {

    private Long driverId;
    private Long vehicleId;

    public AssignFleetRequest() {}

    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
}
`);

writeFile('dto/warehouse/UpdateWarehouseDetailsRequest.java', `
package com.primeroute.logistics.dto.warehouse;

public class UpdateWarehouseDetailsRequest {

    private String operatingHours;
    private String contactPhone;
    private String contactEmail;
    private String managerPhone;

    public UpdateWarehouseDetailsRequest() {}

    public String getOperatingHours() { return operatingHours; }
    public void setOperatingHours(String operatingHours) { this.operatingHours = operatingHours; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getManagerPhone() { return managerPhone; }
    public void setManagerPhone(String managerPhone) { this.managerPhone = managerPhone; }
}
`);

writeFile('dto/warehouse/WarehouseReportDTO.java', `
package com.primeroute.logistics.dto.warehouse;

import java.util.List;
import java.util.Map;

public class WarehouseReportDTO {

    private String warehouseCode;
    private String warehouseName;
    private String dateRange;

    // Aggregated Metrics
    private long totalItems;
    private long totalStockQuantity;
    private double stockValue;
    private long totalDispatches;
    private long activeShipments;
    private double averageUtilization;

    // Charts data
    private List<Map<String, Object>> stockByCategory;
    private List<Map<String, Object>> dailyDispatches;
    private List<Map<String, Object>> fleetUtilization;
    private List<Map<String, Object>> transactionBreakdown;

    public WarehouseReportDTO() {}

    public String getWarehouseCode() { return warehouseCode; }
    public void setWarehouseCode(String warehouseCode) { this.warehouseCode = warehouseCode; }

    public String getWarehouseName() { return warehouseName; }
    public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }

    public String getDateRange() { return dateRange; }
    public void setDateRange(String dateRange) { this.dateRange = dateRange; }

    public long getTotalItems() { return totalItems; }
    public void setTotalItems(long totalItems) { this.totalItems = totalItems; }

    public long getTotalStockQuantity() { return totalStockQuantity; }
    public void setTotalStockQuantity(long totalStockQuantity) { this.totalStockQuantity = totalStockQuantity; }

    public double getStockValue() { return stockValue; }
    public void setStockValue(double stockValue) { this.stockValue = stockValue; }

    public long getTotalDispatches() { return totalDispatches; }
    public void setTotalDispatches(long totalDispatches) { this.totalDispatches = totalDispatches; }

    public long getActiveShipments() { return activeShipments; }
    public void setActiveShipments(long activeShipments) { this.activeShipments = activeShipments; }

    public double getAverageUtilization() { return averageUtilization; }
    public void setAverageUtilization(double averageUtilization) { this.averageUtilization = averageUtilization; }

    public List<Map<String, Object>> getStockByCategory() { return stockByCategory; }
    public void setStockByCategory(List<Map<String, Object>> stockByCategory) { this.stockByCategory = stockByCategory; }

    public List<Map<String, Object>> getDailyDispatches() { return dailyDispatches; }
    public void setDailyDispatches(List<Map<String, Object>> dailyDispatches) { this.dailyDispatches = dailyDispatches; }

    public List<Map<String, Object>> getFleetUtilization() { return fleetUtilization; }
    public void setFleetUtilization(List<Map<String, Object>> fleetUtilization) { this.fleetUtilization = fleetUtilization; }

    public List<Map<String, Object>> getTransactionBreakdown() { return transactionBreakdown; }
    public void setTransactionBreakdown(List<Map<String, Object>> transactionBreakdown) { this.transactionBreakdown = transactionBreakdown; }
}
`);

console.log('All Warehouse DTOs created successfully.');
