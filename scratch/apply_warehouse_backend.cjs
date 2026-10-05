const fs = require('fs');
const path = require('path');

const BASE_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

function writeFile(relPath, content) {
  const fullPath = path.join(BASE_DIR, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Wrote: ' + relPath);
}

// 1. Role.java
writeFile('entity/Role.java', `
package com.primeroute.logistics.entity;

public enum Role {
    ADMIN,
    CUSTOMER,
    WAREHOUSE_MANAGER
}
`);

// 2. InventoryTransactionType.java
writeFile('entity/InventoryTransactionType.java', `
package com.primeroute.logistics.entity;

public enum InventoryTransactionType {
    RECEIVE,
    DISPATCH,
    RESERVE,
    RELEASE,
    TRANSFER_IN,
    TRANSFER_OUT,
    ADJUSTMENT,
    DAMAGE
}
`);

// 3. Inventory.java
writeFile('entity/Inventory.java', `
package com.primeroute.logistics.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventories")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String sku;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(nullable = false)
    private String category;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @Column(name = "total_stock", nullable = false)
    private Integer totalStock = 0;

    @Column(name = "reserved_stock", nullable = false)
    private Integer reservedStock = 0;

    @Column(name = "available_stock", nullable = false)
    private Integer availableStock = 0;

    @Column(name = "damaged_stock", nullable = false)
    private Integer damagedStock = 0;

    @Column(name = "reorder_level", nullable = false)
    private Integer reorderLevel = 10;

    @Column(name = "unit_price")
    private Double unitPrice = 0.0;

    @Column(nullable = false)
    private String unit = "Units";

    @Column(name = "status", nullable = false)
    private String status = "IN_STOCK";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Inventory() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        recalculate();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        recalculate();
    }

    public void recalculate() {
        if (this.totalStock == null) this.totalStock = 0;
        if (this.reservedStock == null) this.reservedStock = 0;
        if (this.damagedStock == null) this.damagedStock = 0;
        if (this.reorderLevel == null) this.reorderLevel = 10;
        if (this.unit == null || this.unit.isBlank()) this.unit = "Units";

        this.availableStock = Math.max(0, this.totalStock - this.reservedStock - this.damagedStock);

        if (this.availableStock <= 0) {
            this.status = "OUT_OF_STOCK";
        } else if (this.availableStock <= this.reorderLevel) {
            this.status = "LOW_STOCK";
        } else {
            this.status = "IN_STOCK";
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Warehouse getWarehouse() { return warehouse; }
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }

    public Integer getTotalStock() { return totalStock; }
    public void setTotalStock(Integer totalStock) { this.totalStock = totalStock; }

    public Integer getReservedStock() { return reservedStock; }
    public void setReservedStock(Integer reservedStock) { this.reservedStock = reservedStock; }

    public Integer getAvailableStock() { return availableStock; }
    public void setAvailableStock(Integer availableStock) { this.availableStock = availableStock; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
`);

// 4. InventoryTransaction.java
writeFile('entity/InventoryTransaction.java', `
package com.primeroute.logistics.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_transactions")
public class InventoryTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_id")
    private Inventory inventory;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @Column(nullable = false, length = 50)
    private String sku;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private InventoryTransactionType transactionType;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "previous_available", nullable = false)
    private Integer previousAvailable;

    @Column(name = "new_available", nullable = false)
    private Integer newAvailable;

    @Column(name = "performed_by", nullable = false)
    private String performedBy;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(length = 500)
    private String reason;

    @Column(name = "reference_order")
    private String referenceOrder;

    @Column(name = "reference_shipment")
    private String referenceShipment;

    public InventoryTransaction() {}

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Inventory getInventory() { return inventory; }
    public void setInventory(Inventory inventory) { this.inventory = inventory; }

    public Warehouse getWarehouse() { return warehouse; }
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public InventoryTransactionType getTransactionType() { return transactionType; }
    public void setTransactionType(InventoryTransactionType transactionType) { this.transactionType = transactionType; }

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

// 5. InventoryRepository.java
writeFile('repository/InventoryRepository.java', `
package com.primeroute.logistics.repository;

import com.primeroute.logistics.entity.Inventory;
import com.primeroute.logistics.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    List<Inventory> findByWarehouse(Warehouse warehouse);

    List<Inventory> findByWarehouseOrderBySkuAsc(Warehouse warehouse);

    Optional<Inventory> findByWarehouseAndSku(Warehouse warehouse, String sku);

    Optional<Inventory> findByIdAndWarehouse(Long id, Warehouse warehouse);

    @Query("SELECT i FROM Inventory i WHERE i.warehouse = :warehouse AND i.availableStock <= i.reorderLevel")
    List<Inventory> findLowStockByWarehouse(@Param("warehouse") Warehouse warehouse);

    @Query("SELECT COALESCE(SUM(i.totalStock), 0) FROM Inventory i WHERE i.warehouse = :warehouse")
    Long sumTotalStockByWarehouse(@Param("warehouse") Warehouse warehouse);

    @Query("SELECT COALESCE(SUM(i.availableStock), 0) FROM Inventory i WHERE i.warehouse = :warehouse")
    Long sumAvailableStockByWarehouse(@Param("warehouse") Warehouse warehouse);

    @Query("SELECT COALESCE(SUM(i.reservedStock), 0) FROM Inventory i WHERE i.warehouse = :warehouse")
    Long sumReservedStockByWarehouse(@Param("warehouse") Warehouse warehouse);

    @Query("SELECT COALESCE(SUM(i.damagedStock), 0) FROM Inventory i WHERE i.warehouse = :warehouse")
    Long sumDamagedStockByWarehouse(@Param("warehouse") Warehouse warehouse);

    long countByWarehouse(Warehouse warehouse);
}
`);

// 6. InventoryTransactionRepository.java
writeFile('repository/InventoryTransactionRepository.java', `
package com.primeroute.logistics.repository;

import com.primeroute.logistics.entity.InventoryTransaction;
import com.primeroute.logistics.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {

    List<InventoryTransaction> findByWarehouseOrderByTimestampDesc(Warehouse warehouse);

    List<InventoryTransaction> findTop20ByWarehouseOrderByTimestampDesc(Warehouse warehouse);

    List<InventoryTransaction> findByWarehouseAndSkuOrderByTimestampDesc(Warehouse warehouse, String sku);

    @Query("SELECT t FROM InventoryTransaction t WHERE t.warehouse = :warehouse " +
           "AND (:sku IS NULL OR LOWER(t.sku) LIKE LOWER(CONCAT('%', :sku, '%'))) " +
           "AND (:startDate IS NULL OR t.timestamp >= :startDate) " +
           "AND (:endDate IS NULL OR t.timestamp <= :endDate) " +
           "ORDER BY t.timestamp DESC")
    List<InventoryTransaction> filterTransactions(
            @Param("warehouse") Warehouse warehouse,
            @Param("sku") String sku,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
`);

console.log('Entities and Repositories written successfully.');
