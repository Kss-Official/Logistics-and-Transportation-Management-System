const fs = require('fs');
const file = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/repository/ShipmentRepository.java';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `    @Query("SELECT s FROM Shipment s WHERE s.vehicle = :vehicle AND s.status NOT IN (com.primeroute.logistics.entity.OrderStatus.DELIVERED, com.primeroute.logistics.entity.OrderStatus.CANCELLED) ORDER BY s.updatedAt DESC")
    List<Shipment> findActiveShipmentsByVehicle(@Param("vehicle") Vehicle vehicle);

    @Query("SELECT s FROM Shipment s WHERE s.driver = :driver AND s.status NOT IN (com.primeroute.logistics.entity.OrderStatus.DELIVERED, com.primeroute.logistics.entity.OrderStatus.CANCELLED) ORDER BY s.updatedAt DESC")
    List<Shipment> findActiveShipmentsByDriver(@Param("driver") Driver driver);`,
  `    @Query("SELECT s FROM Shipment s WHERE s.vehicle = :vehicle AND s.status IN (com.primeroute.logistics.entity.OrderStatus.IN_TRANSIT, com.primeroute.logistics.entity.OrderStatus.OUT_FOR_DELIVERY) ORDER BY s.updatedAt DESC")
    List<Shipment> findActiveShipmentsByVehicle(@Param("vehicle") Vehicle vehicle);

    @Query("SELECT s FROM Shipment s WHERE s.driver = :driver AND s.status IN (com.primeroute.logistics.entity.OrderStatus.IN_TRANSIT, com.primeroute.logistics.entity.OrderStatus.OUT_FOR_DELIVERY) ORDER BY s.updatedAt DESC")
    List<Shipment> findActiveShipmentsByDriver(@Param("driver") Driver driver);`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated ShipmentRepository.java active queries');
