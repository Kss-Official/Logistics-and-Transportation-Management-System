const fs = require('fs');
const path = require('path');

const base = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics';
const shipRepoPath = path.join(base, 'repository', 'ShipmentRepository.java');

fs.writeFileSync(shipRepoPath, `package com.primeroute.logistics.repository;

import com.primeroute.logistics.entity.Warehouse;
import com.primeroute.logistics.entity.Driver;
import com.primeroute.logistics.entity.Order;
import com.primeroute.logistics.entity.Shipment;
import com.primeroute.logistics.entity.User;
import com.primeroute.logistics.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    @Query("SELECT DISTINCT s FROM Shipment s " +
           "LEFT JOIN FETCH s.order o " +
           "LEFT JOIN FETCH o.customer c " +
           "LEFT JOIN FETCH o.pickupAddress pa " +
           "LEFT JOIN FETCH o.deliveryAddress da " +
           "LEFT JOIN FETCH s.driver d " +
           "LEFT JOIN FETCH s.vehicle v " +
           "LEFT JOIN FETCH s.originWarehouse ow " +
           "ORDER BY s.createdAt DESC")
    List<Shipment> findAllWithDetails();

    Optional<Shipment> findByTrackingNumber(String trackingNumber);

    Optional<Shipment> findByOrder(Order order);

    Optional<Shipment> findByOrder_OrderNumber(String orderNumber);

    List<Shipment> findByOrder_CustomerOrderByCreatedAtDesc(User customer);

    Optional<Shipment> findByTrackingNumberAndOrder_Customer(String trackingNumber, User customer);

    Optional<Shipment> findByOrder_OrderNumberAndOrder_Customer(String orderNumber, User customer);

    boolean existsByTrackingNumber(String trackingNumber);

    List<Shipment> findTop5ByOrderByCreatedAtDesc();

    List<Shipment> findByOrder_Customer(User customer);

    long countByOrder_Customer(User customer);

    long countByStatus(com.primeroute.logistics.entity.OrderStatus status);

    @Query("SELECT s FROM Shipment s WHERE s.vehicle = :vehicle AND s.status NOT IN (com.primeroute.logistics.entity.OrderStatus.DELIVERED, com.primeroute.logistics.entity.OrderStatus.CANCELLED) ORDER BY s.updatedAt DESC")
    List<Shipment> findActiveShipmentsByVehicle(@Param("vehicle") Vehicle vehicle);

    @Query("SELECT s FROM Shipment s WHERE s.driver = :driver AND s.status NOT IN (com.primeroute.logistics.entity.OrderStatus.DELIVERED, com.primeroute.logistics.entity.OrderStatus.CANCELLED) ORDER BY s.updatedAt DESC")
    List<Shipment> findActiveShipmentsByDriver(@Param("driver") Driver driver);

    @Query("SELECT s FROM Shipment s WHERE s.driver = :driver ORDER BY s.createdAt DESC")
    List<Shipment> findByDriverOrderByCreatedAtDesc(@Param("driver") Driver driver);

    @Query("SELECT COUNT(s) FROM Shipment s WHERE s.driver = :driver AND s.status = com.primeroute.logistics.entity.OrderStatus.DELIVERED")
    long countCompletedByDriver(@Param("driver") Driver driver);

    long countByDriver(Driver driver);

    long countByDriverAndStatus(Driver driver, com.primeroute.logistics.entity.OrderStatus status);

    @Query("SELECT COUNT(s) FROM Shipment s WHERE s.route = :route AND s.status NOT IN (com.primeroute.logistics.entity.OrderStatus.DELIVERED, com.primeroute.logistics.entity.OrderStatus.CANCELLED)")
    long countActiveShipmentsByRoute(@Param("route") com.primeroute.logistics.entity.Route route);

    @Query("SELECT s FROM Shipment s WHERE s.route = :route ORDER BY s.createdAt DESC")
    List<Shipment> findByRoute(@Param("route") com.primeroute.logistics.entity.Route route);

    long countByRoute(com.primeroute.logistics.entity.Route route);

    List<Shipment> findByOriginWarehouseOrderByCreatedAtDesc(Warehouse originWarehouse);

    @Query("SELECT s FROM Shipment s WHERE s.originWarehouse = :warehouse AND s.status NOT IN (com.primeroute.logistics.entity.OrderStatus.DELIVERED, com.primeroute.logistics.entity.OrderStatus.CANCELLED) ORDER BY s.createdAt DESC")
    List<Shipment> findActiveOutgoingByWarehouse(@Param("warehouse") Warehouse warehouse);

    List<Shipment> findByDestinationWarehouseOrderByCreatedAtDesc(Warehouse destinationWarehouse);

    @Query("SELECT s FROM Shipment s WHERE s.destinationWarehouse = :warehouse AND (s.originWarehouse IS NULL OR s.originWarehouse != :warehouse) ORDER BY s.createdAt DESC")
    List<Shipment> findIncomingShipmentsForWarehouse(@Param("warehouse") Warehouse warehouse);

    @Query("SELECT s FROM Shipment s WHERE s.originWarehouse = :warehouse AND s.status IN :statuses ORDER BY s.createdAt DESC")
    List<Shipment> findOutgoingByWarehouseAndStatuses(
            @Param("warehouse") Warehouse warehouse,
            @Param("statuses") List<com.primeroute.logistics.entity.OrderStatus> statuses
    );

    @Query("SELECT s FROM Shipment s WHERE s.destinationWarehouse = :warehouse AND s.status != com.primeroute.logistics.entity.OrderStatus.DELIVERED ORDER BY s.createdAt DESC")
    List<Shipment> findActiveIncomingByWarehouse(@Param("warehouse") Warehouse warehouse);

    @Query("SELECT s FROM Shipment s WHERE s.originWarehouse = :warehouse AND s.operationalStage = 'READY_FOR_DISPATCH' AND s.status != com.primeroute.logistics.entity.OrderStatus.DELIVERED AND s.status != com.primeroute.logistics.entity.OrderStatus.CANCELLED")
    List<Shipment> findReadyForDispatchByWarehouse(@Param("warehouse") Warehouse warehouse);

    long countByOriginWarehouse(Warehouse originWarehouse);

    long countByDestinationWarehouse(Warehouse destinationWarehouse);
}
`);
console.log('ShipmentRepository successfully updated.');
