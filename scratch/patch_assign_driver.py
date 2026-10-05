import os

BACKEND_DIR = r"C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management"
service_path = os.path.join(BACKEND_DIR, r"src\main\java\com\primeroute\logistics\service\AdminShipmentService.java")

with open(service_path, "r", encoding="utf-8") as f:
    content = f.read()

target = """        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + driverId));

        if (driver.getStatus() == DriverStatus.INACTIVE) {
            throw new IllegalArgumentException("Cannot assign inactive driver " + driver.getFullName() + " to shipment.");
        }

        List<Shipment> activeShipments = shipmentRepository.findActiveShipmentsByDriver(driver);
        boolean hasOtherActive = activeShipments.stream().anyMatch(s -> !s.getId().equals(shipmentId));
        if (hasOtherActive) {
            Shipment activeOnDriver = activeShipments.stream().filter(s -> !s.getId().equals(shipmentId)).findFirst().get();
            throw new IllegalArgumentException("Driver " + driver.getFullName() + " is currently assigned to an active shipment (" + activeOnDriver.getTrackingNumber() + ").");
        }

        // If shipment already has a vehicle assigned, enforce vehicle's assigned driver match
        if (shipment.getVehicle() != null) {
            Vehicle v = shipment.getVehicle();
            if (v.getAssignedDriver() == null) {
                throw new IllegalArgumentException("Vehicle " + v.getVehicleNumber() + " does not have an assigned driver.");
            }
            if (!v.getAssignedDriver().getId().equals(driver.getId())) {
                throw new IllegalArgumentException("Vehicle " + v.getVehicleNumber() + " is assigned to " + v.getAssignedDriver().getFullName() + " and cannot be assigned to another driver.");
            }
            // Do NOT overwrite vehicle.setAssignedDriver!
        }"""

replacement = """        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + driverId));

        if (driver.getStatus() == DriverStatus.INACTIVE) {
            throw new IllegalArgumentException("Cannot assign inactive driver " + driver.getFullName() + " to shipment.");
        }

        // If shipment already has a vehicle assigned, enforce vehicle's assigned driver match first
        if (shipment.getVehicle() != null) {
            Vehicle v = shipment.getVehicle();
            if (v.getAssignedDriver() == null) {
                throw new IllegalArgumentException("Vehicle " + v.getVehicleNumber() + " does not have an assigned driver.");
            }
            if (!v.getAssignedDriver().getId().equals(driver.getId())) {
                throw new IllegalArgumentException("Vehicle " + v.getVehicleNumber() + " is assigned to " + v.getAssignedDriver().getFullName() + " and cannot be assigned to another driver.");
            }
            // Do NOT overwrite vehicle.setAssignedDriver!
        }

        List<Shipment> activeShipments = shipmentRepository.findActiveShipmentsByDriver(driver);
        boolean hasOtherActive = activeShipments.stream().anyMatch(s -> !s.getId().equals(shipmentId));
        if (hasOtherActive) {
            Shipment activeOnDriver = activeShipments.stream().filter(s -> !s.getId().equals(shipmentId)).findFirst().get();
            throw new IllegalArgumentException("Driver " + driver.getFullName() + " is currently assigned to an active shipment (" + activeOnDriver.getTrackingNumber() + ").");
        }"""

assert target in content, "target not found in content!"
content = content.replace(target, replacement)
with open(service_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated assignDriver check order.")
