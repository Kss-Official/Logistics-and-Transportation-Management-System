import os

BACKEND_DIR = r"C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management"

# 1. Update ShipmentRepository.java
shipment_repo_path = os.path.join(BACKEND_DIR, r"src\main\java\com\primeroute\logistics\repository\ShipmentRepository.java")
with open(shipment_repo_path, "r", encoding="utf-8") as f:
    sr_content = f.read()

old_sr_veh_q = """    @Query("SELECT s FROM Shipment s WHERE s.vehicle = :vehicle AND s.status IN (com.primeroute.logistics.entity.OrderStatus.IN_TRANSIT, com.primeroute.logistics.entity.OrderStatus.OUT_FOR_DELIVERY) ORDER BY s.updatedAt DESC")
    List<Shipment> findActiveShipmentsByVehicle(@Param("vehicle") Vehicle vehicle);

    @Query("SELECT s FROM Shipment s WHERE s.driver = :driver AND s.status IN (com.primeroute.logistics.entity.OrderStatus.IN_TRANSIT, com.primeroute.logistics.entity.OrderStatus.OUT_FOR_DELIVERY) ORDER BY s.updatedAt DESC")
    List<Shipment> findActiveShipmentsByDriver(@Param("driver") Driver driver);"""

new_sr_veh_q = """    @Query("SELECT s FROM Shipment s WHERE s.vehicle = :vehicle AND s.status NOT IN (com.primeroute.logistics.entity.OrderStatus.DELIVERED, com.primeroute.logistics.entity.OrderStatus.CANCELLED) ORDER BY s.updatedAt DESC")
    List<Shipment> findActiveShipmentsByVehicle(@Param("vehicle") Vehicle vehicle);

    @Query("SELECT s FROM Shipment s WHERE s.driver = :driver AND s.status NOT IN (com.primeroute.logistics.entity.OrderStatus.DELIVERED, com.primeroute.logistics.entity.OrderStatus.CANCELLED) ORDER BY s.updatedAt DESC")
    List<Shipment> findActiveShipmentsByDriver(@Param("driver") Driver driver);"""

if old_sr_veh_q in sr_content:
    sr_content = sr_content.replace(old_sr_veh_q, new_sr_veh_q)
    with open(shipment_repo_path, "w", encoding="utf-8") as f:
        f.write(sr_content)
    print("[1] Updated ShipmentRepository.java queries")
else:
    print("[1] WARNING: Query not found in ShipmentRepository.java")

# 2. Update VehicleRepository.java
vehicle_repo_path = os.path.join(BACKEND_DIR, r"src\main\java\com\primeroute\logistics\repository\VehicleRepository.java")
with open(vehicle_repo_path, "r", encoding="utf-8") as f:
    vr_content = f.read()

old_vr_avail_q = """    @Query("SELECT v FROM Vehicle v WHERE v.status NOT IN (com.primeroute.logistics.entity.VehicleStatus.INACTIVE, com.primeroute.logistics.entity.VehicleStatus.MAINTENANCE) " +
           "AND NOT EXISTS (" +
           "  SELECT s FROM Shipment s WHERE s.vehicle = v " +
           "  AND s.status NOT IN (com.primeroute.logistics.entity.OrderStatus.DELIVERED, com.primeroute.logistics.entity.OrderStatus.CANCELLED)" +
           ") ORDER BY v.createdAt DESC")
    List<Vehicle> findAvailableVehicles();"""

new_vr_avail_q = """    @Query("SELECT v FROM Vehicle v WHERE v.status NOT IN (com.primeroute.logistics.entity.VehicleStatus.INACTIVE, com.primeroute.logistics.entity.VehicleStatus.MAINTENANCE) " +
           "AND v.assignedDriver IS NOT NULL " +
           "AND NOT EXISTS (" +
           "  SELECT s FROM Shipment s WHERE s.vehicle = v " +
           "  AND s.status NOT IN (com.primeroute.logistics.entity.OrderStatus.DELIVERED, com.primeroute.logistics.entity.OrderStatus.CANCELLED)" +
           ") ORDER BY v.createdAt DESC")
    List<Vehicle> findAvailableVehicles();"""

if old_vr_avail_q in vr_content:
    vr_content = vr_content.replace(old_vr_avail_q, new_vr_avail_q)
    with open(vehicle_repo_path, "w", encoding="utf-8") as f:
        f.write(vr_content)
    print("[2] Updated VehicleRepository.java findAvailableVehicles query")
else:
    print("[2] WARNING: Query not found in VehicleRepository.java")
