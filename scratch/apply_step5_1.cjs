const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const JAVA_ROOT = path.join(BACKEND_ROOT, 'src', 'main', 'java', 'com', 'primeroute', 'logistics');

const statusEnumCode = `package com.primeroute.logistics.entity;

public enum FulfillmentAllocationStatus {
    PENDING,
    ALLOCATED,
    EXCEPTION,
    RELEASED,
    CANCELLED
}
`;

const methodEnumCode = `package com.primeroute.logistics.entity;

public enum FulfillmentAllocationMethod {
    AUTOMATIC,
    MANUAL,
    ADMIN_OVERRIDE
}
`;

const entityCode = `package com.primeroute.logistics.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fulfillment_allocations", indexes = {
    @Index(name = "idx_alloc_order_id", columnList = "order_id"),
    @Index(name = "idx_alloc_warehouse_id", columnList = "warehouse_id"),
    @Index(name = "idx_alloc_status", columnList = "allocation_status")
})
public class FulfillmentAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @Enumerated(EnumType.STRING)
    @Column(name = "allocation_status", nullable = false, length = 50)
    private FulfillmentAllocationStatus allocationStatus = FulfillmentAllocationStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "allocation_method", nullable = false, length = 50)
    private FulfillmentAllocationMethod allocationMethod = FulfillmentAllocationMethod.AUTOMATIC;

    @Column(name = "allocation_score")
    private Double allocationScore;

    @Column(name = "distance_km")
    private Double distanceKm;

    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "allocated_at")
    private LocalDateTime allocatedAt;

    @Column(name = "allocated_by", length = 150)
    private String allocatedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public FulfillmentAllocation() {}

    public FulfillmentAllocation(
            Order order,
            Warehouse warehouse,
            FulfillmentAllocationStatus allocationStatus,
            FulfillmentAllocationMethod allocationMethod,
            Double allocationScore,
            Double distanceKm,
            String reason,
            LocalDateTime allocatedAt,
            String allocatedBy) {
        this.order = order;
        this.warehouse = warehouse;
        this.allocationStatus = allocationStatus;
        this.allocationMethod = allocationMethod;
        this.allocationScore = allocationScore;
        this.distanceKm = distanceKm;
        this.reason = reason;
        this.allocatedAt = allocatedAt;
        this.allocatedBy = allocatedBy;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.allocationStatus == null) {
            this.allocationStatus = FulfillmentAllocationStatus.PENDING;
        }
        if (this.allocationMethod == null) {
            this.allocationMethod = FulfillmentAllocationMethod.AUTOMATIC;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public Warehouse getWarehouse() {
        return warehouse;
    }

    public void setWarehouse(Warehouse warehouse) {
        this.warehouse = warehouse;
    }

    public FulfillmentAllocationStatus getAllocationStatus() {
        return allocationStatus;
    }

    public void setAllocationStatus(FulfillmentAllocationStatus allocationStatus) {
        this.allocationStatus = allocationStatus;
    }

    public FulfillmentAllocationMethod getAllocationMethod() {
        return allocationMethod;
    }

    public void setAllocationMethod(FulfillmentAllocationMethod allocationMethod) {
        this.allocationMethod = allocationMethod;
    }

    public Double getAllocationScore() {
        return allocationScore;
    }

    public void setAllocationScore(Double allocationScore) {
        this.allocationScore = allocationScore;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getAllocatedAt() {
        return allocatedAt;
    }

    public void setAllocatedAt(LocalDateTime allocatedAt) {
        this.allocatedAt = allocatedAt;
    }

    public String getAllocatedBy() {
        return allocatedBy;
    }

    public void setAllocatedBy(String allocatedBy) {
        this.allocatedBy = allocatedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
`;

const repoCode = `package com.primeroute.logistics.repository;

import com.primeroute.logistics.entity.FulfillmentAllocation;
import com.primeroute.logistics.entity.FulfillmentAllocationStatus;
import com.primeroute.logistics.entity.Order;
import com.primeroute.logistics.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FulfillmentAllocationRepository extends JpaRepository<FulfillmentAllocation, Long> {

    List<FulfillmentAllocation> findByOrder(Order order);

    List<FulfillmentAllocation> findByOrderId(Long orderId);

    List<FulfillmentAllocation> findByWarehouse(Warehouse warehouse);

    List<FulfillmentAllocation> findByAllocationStatus(FulfillmentAllocationStatus allocationStatus);

    List<FulfillmentAllocation> findByOrderOrderByAllocatedAtDesc(Order order);

    List<FulfillmentAllocation> findByOrderIdOrderByAllocatedAtDesc(Long orderId);

    Optional<FulfillmentAllocation> findTopByOrderOrderByAllocatedAtDesc(Order order);

    Optional<FulfillmentAllocation> findTopByOrderIdOrderByAllocatedAtDesc(Long orderId);
}
`;

fs.writeFileSync(path.join(JAVA_ROOT, 'entity', 'FulfillmentAllocationStatus.java'), statusEnumCode, 'utf8');
console.log('Created entity/FulfillmentAllocationStatus.java');

fs.writeFileSync(path.join(JAVA_ROOT, 'entity', 'FulfillmentAllocationMethod.java'), methodEnumCode, 'utf8');
console.log('Created entity/FulfillmentAllocationMethod.java');

fs.writeFileSync(path.join(JAVA_ROOT, 'entity', 'FulfillmentAllocation.java'), entityCode, 'utf8');
console.log('Created entity/FulfillmentAllocation.java');

fs.writeFileSync(path.join(JAVA_ROOT, 'repository', 'FulfillmentAllocationRepository.java'), repoCode, 'utf8');
console.log('Created repository/FulfillmentAllocationRepository.java');
