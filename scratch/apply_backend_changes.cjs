const fs = require('fs');
const path = require('path');

const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

function modifyFile(relPath, transform) {
  const fullPath = path.join(BACKEND_DIR, relPath);
  console.log(`Modifying: ${fullPath}`);
  const content = fs.readFileSync(fullPath, 'utf8');
  const updated = transform(content);
  if (content === updated) {
    console.warn(`Warning: No changes made to ${relPath}`);
  } else {
    fs.writeFileSync(fullPath, updated, 'utf8');
    console.log(`Successfully updated ${relPath}`);
  }
}

// 1. ShipmentRepository.java
modifyFile('src/main/java/com/primeroute/logistics/repository/ShipmentRepository.java', (content) => {
  let updated = content;
  if (!updated.includes('import com.primeroute.logistics.entity.Driver;')) {
    updated = updated.replace(
      'import com.primeroute.logistics.entity.Order;',
      'import com.primeroute.logistics.entity.Driver;\nimport com.primeroute.logistics.entity.Order;'
    );
  }
  if (!updated.includes('findActiveShipmentsByDriver')) {
    const target = 'List<Shipment> findActiveShipmentsByVehicle(@Param("vehicle") Vehicle vehicle);';
    const addition = target + '\n\n    @Query("SELECT s FROM Shipment s WHERE s.driver = :driver AND s.status NOT IN (com.primeroute.logistics.entity.OrderStatus.DELIVERED, com.primeroute.logistics.entity.OrderStatus.CANCELLED) ORDER BY s.updatedAt DESC")\n    List<Shipment> findActiveShipmentsByDriver(@Param("driver") Driver driver);';
    updated = updated.replace(target, addition);
  }
  return updated;
});

// 2. DriverRepository.java
modifyFile('src/main/java/com/primeroute/logistics/repository/DriverRepository.java', (content) => {
  let updated = content;
  if (!updated.includes('findAvailableDrivers()')) {
    const target = 'List<Driver> findByStatusOrderByFullNameAsc(DriverStatus status);';
    const addition = target + '\n\n    @Query("SELECT d FROM Driver d WHERE d.status != com.primeroute.logistics.entity.DriverStatus.INACTIVE " +\n           "AND NOT EXISTS (" +\n           "  SELECT s FROM Shipment s WHERE s.driver = d " +\n           "  AND s.status NOT IN (com.primeroute.logistics.entity.OrderStatus.DELIVERED, com.primeroute.logistics.entity.OrderStatus.CANCELLED)" +\n           ") ORDER BY d.fullName ASC")\n    List<Driver> findAvailableDrivers();';
    updated = updated.replace(target, addition);
  }
  return updated;
});

// 3. VehicleRepository.java
modifyFile('src/main/java/com/primeroute/logistics/repository/VehicleRepository.java', (content) => {
  let updated = content;
  if (!updated.includes('findAvailableVehicles()')) {
    const target = 'List<Vehicle> findAllByOrderByCreatedAtDesc();';
    const addition = target + '\n\n    @Query("SELECT v FROM Vehicle v WHERE v.status NOT IN (com.primeroute.logistics.entity.VehicleStatus.INACTIVE, com.primeroute.logistics.entity.VehicleStatus.MAINTENANCE) " +\n           "AND NOT EXISTS (" +\n           "  SELECT s FROM Shipment s WHERE s.vehicle = v " +\n           "  AND s.status NOT IN (com.primeroute.logistics.entity.OrderStatus.DELIVERED, com.primeroute.logistics.entity.OrderStatus.CANCELLED)" +\n           ") ORDER BY v.createdAt DESC")\n    List<Vehicle> findAvailableVehicles();';
    updated = updated.replace(target, addition);
  }
  return updated;
});

// 4. AdminDriverService.java
modifyFile('src/main/java/com/primeroute/logistics/service/AdminDriverService.java', (content) => {
  let updated = content;
  if (!updated.includes('ShipmentRepository shipmentRepository')) {
    updated = updated.replace(
      'private final DriverRepository driverRepository;',
      'private final DriverRepository driverRepository;\n    private final com.primeroute.logistics.repository.ShipmentRepository shipmentRepository;'
    );
    updated = updated.replace(
      'public AdminDriverService(DriverRepository driverRepository) {\n        this.driverRepository = driverRepository;\n    }',
      'public AdminDriverService(DriverRepository driverRepository, com.primeroute.logistics.repository.ShipmentRepository shipmentRepository) {\n        this.driverRepository = driverRepository;\n        this.shipmentRepository = shipmentRepository;\n    }'
    );
  }
  // Replace getAvailableDrivers
  const oldGetAvailable = `    @Transactional(readOnly = true)
    public List<AdminDriverDTO> getAvailableDrivers() {
        List<Driver> available = driverRepository.findByStatusOrderByFullNameAsc(DriverStatus.AVAILABLE);
        return available.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }`;
  const newGetAvailable = `    @Transactional(readOnly = true)
    public List<AdminDriverDTO> getAvailableDrivers() {
        List<Driver> available = driverRepository.findAvailableDrivers();
        return available.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }`;
  updated = updated.replace(oldGetAvailable, newGetAvailable);
  return updated;
});

// 5. AdminShipmentService.java
modifyFile('src/main/java/com/primeroute/logistics/service/AdminShipmentService.java', (content) => {
  let updated = content;
  
  // Guard driver assignment in createShipment
  const oldDriverBlock = `            if (driver.getStatus() == DriverStatus.INACTIVE) {
                throw new IllegalArgumentException("Cannot assign inactive driver " + driver.getFullName() + " to shipment.");
            }
            shipment.setDriver(driver);`;
  const newDriverBlock = `            if (driver.getStatus() == DriverStatus.INACTIVE) {
                throw new IllegalArgumentException("Cannot assign inactive driver " + driver.getFullName() + " to shipment.");
            }
            List<Shipment> activeDriverShipments = shipmentRepository.findActiveShipmentsByDriver(driver);
            if (!activeDriverShipments.isEmpty()) {
                throw new IllegalArgumentException("Driver " + driver.getFullName() + " is already assigned to an active shipment (" + activeDriverShipments.get(0).getTrackingNumber() + ") and cannot be assigned.");
            }
            shipment.setDriver(driver);`;
  updated = updated.replace(oldDriverBlock, newDriverBlock);

  // Guard vehicle assignment in createShipment
  const oldVehicleBlock = `            if (vehicle.getStatus() == VehicleStatus.INACTIVE || vehicle.getStatus() == VehicleStatus.MAINTENANCE) {
                throw new IllegalArgumentException("Cannot assign vehicle " + vehicle.getVehicleNumber() + " with status " + vehicle.getStatus() + " to shipment.");
            }
            shipment.setVehicle(vehicle);`;
  const newVehicleBlock = `            if (vehicle.getStatus() == VehicleStatus.INACTIVE || vehicle.getStatus() == VehicleStatus.MAINTENANCE) {
                throw new IllegalArgumentException("Cannot assign vehicle " + vehicle.getVehicleNumber() + " with status " + vehicle.getStatus() + " to shipment.");
            }
            List<Shipment> activeVehicleShipments = shipmentRepository.findActiveShipmentsByVehicle(vehicle);
            if (!activeVehicleShipments.isEmpty()) {
                throw new IllegalArgumentException("Vehicle " + vehicle.getVehicleNumber() + " is already assigned to an active shipment (" + activeVehicleShipments.get(0).getTrackingNumber() + ") and cannot be assigned.");
            }
            shipment.setVehicle(vehicle);`;
  updated = updated.replace(oldVehicleBlock, newVehicleBlock);

  // Update updateShipmentStatus driver reset logic
  const oldDeliveredDriver = `        // If shipment is DELIVERED or CANCELLED, free the assigned driver back to AVAILABLE
        if (newStatus == OrderStatus.DELIVERED || newStatus == OrderStatus.CANCELLED) {
            if (shipment.getDriver() != null) {
                Driver driver = shipment.getDriver();
                if (driver.getStatus() != DriverStatus.INACTIVE) {
                    driver.setStatus(DriverStatus.AVAILABLE);
                    driverRepository.save(driver);
                    log.info("Driver {} (ID: {}) transitioned back to AVAILABLE as shipment {} completed.",
                            driver.getFullName(), driver.getId(), shipment.getTrackingNumber());
                }
            }`;
  const newDeliveredDriver = `        // If shipment is DELIVERED or CANCELLED, free the assigned driver back to AVAILABLE ONLY IF no other active shipments exist
        if (newStatus == OrderStatus.DELIVERED || newStatus == OrderStatus.CANCELLED) {
            if (shipment.getDriver() != null) {
                Driver driver = shipment.getDriver();
                List<Shipment> remainingActive = shipmentRepository.findActiveShipmentsByDriver(driver);
                boolean hasOtherActive = remainingActive.stream().anyMatch(s -> !s.getId().equals(shipment.getId()));
                if (!hasOtherActive && driver.getStatus() != DriverStatus.INACTIVE) {
                    driver.setStatus(DriverStatus.AVAILABLE);
                    driverRepository.save(driver);
                    log.info("Driver {} (ID: {}) transitioned back to AVAILABLE as shipment {} completed.",
                            driver.getFullName(), driver.getId(), shipment.getTrackingNumber());
                }
            }`;
  updated = updated.replace(oldDeliveredDriver, newDeliveredDriver);

  // Update updateShipment driver reset logic
  const oldUpdateShipmentDriver = `            if (request.getStatus() == OrderStatus.DELIVERED || request.getStatus() == OrderStatus.CANCELLED) {
                if (shipment.getDriver() != null && shipment.getDriver().getStatus() != DriverStatus.INACTIVE) {
                    shipment.getDriver().setStatus(DriverStatus.AVAILABLE);
                    driverRepository.save(shipment.getDriver());
                }`;
  const newUpdateShipmentDriver = `            if (request.getStatus() == OrderStatus.DELIVERED || request.getStatus() == OrderStatus.CANCELLED) {
                if (shipment.getDriver() != null && shipment.getDriver().getStatus() != DriverStatus.INACTIVE) {
                    Driver driver = shipment.getDriver();
                    List<Shipment> remaining = shipmentRepository.findActiveShipmentsByDriver(driver);
                    boolean hasOther = remaining.stream().anyMatch(s -> !s.getId().equals(shipment.getId()));
                    if (!hasOther) {
                        driver.setStatus(DriverStatus.AVAILABLE);
                        driverRepository.save(driver);
                    }
                }`;
  updated = updated.replace(oldUpdateShipmentDriver, newUpdateShipmentDriver);

  return updated;
});

// 6. AdminVehicleService.java
modifyFile('src/main/java/com/primeroute/logistics/service/AdminVehicleService.java', (content) => {
  let updated = content;
  if (!updated.includes('getAvailableVehicles()')) {
    const target = `    @Transactional(readOnly = true)
    public List<VehicleDTO> getAllVehicles() {
        List<Vehicle> vehicles = vehicleRepository.findAllByOrderByCreatedAtDesc();
        return vehicles.stream().map(this::convertToDTO).collect(Collectors.toList());
    }`;
    const addition = target + `\n\n    @Transactional(readOnly = true)
    public List<VehicleDTO> getAvailableVehicles() {
        List<Vehicle> vehicles = vehicleRepository.findAvailableVehicles();
        return vehicles.stream().map(this::convertToDTO).collect(Collectors.toList());
    }`;
    updated = updated.replace(target, addition);
  }
  return updated;
});

// 7. AdminVehicleController.java
modifyFile('src/main/java/com/primeroute/logistics/controller/AdminVehicleController.java', (content) => {
  let updated = content;
  if (!updated.includes('getAvailableVehicles()')) {
    const target = `    @GetMapping
    public ResponseEntity<ApiResponse<List<VehicleDTO>>> getAllVehicles() {
        List<VehicleDTO> list = adminVehicleService.getAllVehicles();
        return ResponseEntity.ok(new ApiResponse<>(true, "Vehicles retrieved successfully", list));
    }`;
    const addition = target + `\n\n    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<VehicleDTO>>> getAvailableVehicles() {
        List<VehicleDTO> available = adminVehicleService.getAvailableVehicles();
        return ResponseEntity.ok(new ApiResponse<>(true, "Available vehicles retrieved successfully", available));
    }`;
    updated = updated.replace(target, addition);
  }
  return updated;
});

console.log('All backend modifications finished.');
