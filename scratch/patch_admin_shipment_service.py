import os

BACKEND_DIR = r"C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management"
service_path = os.path.join(BACKEND_DIR, r"src\main\java\com\primeroute\logistics\service\AdminShipmentService.java")

with open(service_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Target block for createShipment: from "// Driver Assignment" down to before "// Status alignment"
old_create_assign = """        // Driver Assignment
        if (driverId != null) {
            Driver driver = driverRepository.findById(driverId)
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + driverId));
            if (driver.getStatus() == DriverStatus.INACTIVE) {
                throw new IllegalArgumentException("Cannot assign inactive driver " + driver.getFullName() + " to shipment.");
            }
            List<Shipment> activeDriverShipments = shipmentRepository.findActiveShipmentsByDriver(driver);
            if (!activeDriverShipments.isEmpty()) {
                throw new IllegalArgumentException("Driver " + driver.getFullName() + " is already assigned to an active shipment (" + activeDriverShipments.get(0).getTrackingNumber() + ") and cannot be assigned.");
            }
            shipment.setDriver(driver);
            driver.setStatus(DriverStatus.ON_TRIP);
            driverRepository.save(driver);
            log.info("Assigned driver {} (ID: {}) to shipment {}", driver.getFullName(), driver.getId(), shipment.getTrackingNumber());
        }

        // Vehicle Assignment
        if (vehicleId != null) {
            Vehicle vehicle = vehicleRepository.findById(vehicleId)
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + vehicleId));
            if (vehicle.getStatus() == VehicleStatus.INACTIVE) {
                throw new IllegalArgumentException("Cannot assign inactive vehicle " + vehicle.getVehicleNumber() + " to shipment.");
            }
            if (vehicle.getStatus() == VehicleStatus.MAINTENANCE) {
                throw new IllegalArgumentException("Cannot assign vehicle " + vehicle.getVehicleNumber() + " undergoing maintenance.");
            }

            List<Shipment> activeOnVeh = shipmentRepository.findActiveShipmentsByVehicle(vehicle);
            if (!activeOnVeh.isEmpty()) {
                throw new IllegalArgumentException("This vehicle already has an active shipment.");
            }

            shipment.setVehicle(vehicle);
            if (vehicle.getStatus() == VehicleStatus.AVAILABLE) {
                vehicle.setStatus(VehicleStatus.ASSIGNED);
            }
            vehicleRepository.save(vehicle);
            log.info("Assigned vehicle {} (ID: {}) to shipment {}", vehicle.getVehicleNumber(), vehicle.getId(), shipment.getTrackingNumber());
        }"""

new_create_assign = """        // Vehicle & Driver Assignment Validation
        Driver driverToAssign = null;
        Vehicle vehicleToAssign = null;

        if (vehicleId != null) {
            vehicleToAssign = vehicleRepository.findById(vehicleId)
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + vehicleId));
            if (vehicleToAssign.getStatus() == VehicleStatus.INACTIVE) {
                throw new IllegalArgumentException("Cannot assign inactive vehicle " + vehicleToAssign.getVehicleNumber() + " to shipment.");
            }
            if (vehicleToAssign.getStatus() == VehicleStatus.MAINTENANCE) {
                throw new IllegalArgumentException("Cannot assign vehicle " + vehicleToAssign.getVehicleNumber() + " undergoing maintenance.");
            }

            Driver vehAssignedDriver = vehicleToAssign.getAssignedDriver();
            if (vehAssignedDriver == null) {
                throw new IllegalArgumentException("Vehicle " + vehicleToAssign.getVehicleNumber() + " does not have an assigned driver.");
            }

            if (driverId != null && !vehAssignedDriver.getId().equals(driverId)) {
                throw new IllegalArgumentException("Vehicle " + vehicleToAssign.getVehicleNumber() + " is assigned to " + vehAssignedDriver.getFullName() + " and cannot be assigned to another driver.");
            }

            List<Shipment> activeOnVeh = shipmentRepository.findActiveShipmentsByVehicle(vehicleToAssign);
            if (!activeOnVeh.isEmpty()) {
                throw new IllegalArgumentException("Vehicle " + vehicleToAssign.getVehicleNumber() + " is currently assigned to an active shipment (" + activeOnVeh.get(0).getTrackingNumber() + ").");
            }

            driverToAssign = vehAssignedDriver;
        }

        if (driverId != null && driverToAssign == null) {
            driverToAssign = driverRepository.findById(driverId)
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + driverId));
        }

        if (driverToAssign != null) {
            if (driverToAssign.getStatus() == DriverStatus.INACTIVE) {
                throw new IllegalArgumentException("Cannot assign inactive driver " + driverToAssign.getFullName() + " to shipment.");
            }
            List<Shipment> activeDriverShipments = shipmentRepository.findActiveShipmentsByDriver(driverToAssign);
            if (!activeDriverShipments.isEmpty()) {
                throw new IllegalArgumentException("Driver " + driverToAssign.getFullName() + " is currently assigned to an active shipment (" + activeDriverShipments.get(0).getTrackingNumber() + ").");
            }
            shipment.setDriver(driverToAssign);
            driverToAssign.setStatus(DriverStatus.ON_TRIP);
            driverRepository.save(driverToAssign);
            log.info("Assigned driver {} (ID: {}) to shipment {}", driverToAssign.getFullName(), driverToAssign.getId(), shipment.getTrackingNumber());
        }

        if (vehicleToAssign != null) {
            shipment.setVehicle(vehicleToAssign);
            if (vehicleToAssign.getStatus() == VehicleStatus.AVAILABLE) {
                vehicleToAssign.setStatus(VehicleStatus.ASSIGNED);
            }
            vehicleRepository.save(vehicleToAssign);
            log.info("Assigned vehicle {} (ID: {}) to shipment {}", vehicleToAssign.getVehicleNumber(), vehicleToAssign.getId(), shipment.getTrackingNumber());
        }"""

assert old_create_assign in content, "old_create_assign not found in content!"
content = content.replace(old_create_assign, new_create_assign)
print("Replaced createShipment assignment logic.")

# 2. Target block for assignVehicle
old_assign_vehicle = """    public AdminShipmentDTO assignVehicle(Long shipmentId, Long vehicleId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + shipmentId));

        if (vehicleId == null) {
            // Unassigning vehicle
            Vehicle prevVehicle = shipment.getVehicle();
            shipment.setVehicle(null);
            shipment.setUpdatedAt(LocalDateTime.now());
            Shipment saved = shipmentRepository.save(shipment);

            if (prevVehicle != null) {
                List<Shipment> remainingActive = shipmentRepository.findActiveShipmentsByVehicle(prevVehicle);
                if (remainingActive.isEmpty() && prevVehicle.getStatus() != VehicleStatus.INACTIVE && prevVehicle.getStatus() != VehicleStatus.MAINTENANCE) {
                    prevVehicle.setStatus(prevVehicle.getAssignedDriver() != null ? VehicleStatus.ASSIGNED : VehicleStatus.AVAILABLE);
                    vehicleRepository.save(prevVehicle);
                }
            }
            log.info("Vehicle unassigned from shipment {}", shipment.getTrackingNumber());
            return convertToDto(saved, true);
        }

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + vehicleId));

        if (vehicle.getStatus() == VehicleStatus.INACTIVE) {
            throw new IllegalArgumentException("Cannot assign inactive vehicle " + vehicle.getVehicleNumber() + " to shipment.");
        }
        if (vehicle.getStatus() == VehicleStatus.MAINTENANCE) {
            throw new IllegalArgumentException("Cannot assign vehicle " + vehicle.getVehicleNumber() + " undergoing maintenance.");
        }

        // Business rule check: A vehicle should not have more than one active shipment at the same time.
        List<Shipment> activeShipments = shipmentRepository.findActiveShipmentsByVehicle(vehicle);
        boolean hasOtherActive = activeShipments.stream().anyMatch(s -> !s.getId().equals(shipmentId));
        if (hasOtherActive) {
            throw new IllegalArgumentException("This vehicle already has an active shipment.");
        }

        // Previous vehicle cleanup if reassigning
        Vehicle prevVehicle = shipment.getVehicle();
        if (prevVehicle != null && !prevVehicle.getId().equals(vehicle.getId())) {
            List<Shipment> remaining = shipmentRepository.findActiveShipmentsByVehicle(prevVehicle);
            boolean prevHasOther = remaining.stream().anyMatch(s -> !s.getId().equals(shipmentId));
            if (!prevHasOther && prevVehicle.getStatus() != VehicleStatus.INACTIVE && prevVehicle.getStatus() != VehicleStatus.MAINTENANCE) {
                prevVehicle.setStatus(prevVehicle.getAssignedDriver() != null ? VehicleStatus.ASSIGNED : VehicleStatus.AVAILABLE);
                vehicleRepository.save(prevVehicle);
            }
        }

        shipment.setVehicle(vehicle);
        shipment.setUpdatedAt(LocalDateTime.now());

        // Status synchronization:
        if (shipment.getStatus() != OrderStatus.DELIVERED && shipment.getStatus() != OrderStatus.CANCELLED) {
            if (shipment.getStatus() == OrderStatus.IN_TRANSIT || shipment.getStatus() == OrderStatus.OUT_FOR_DELIVERY) {
                vehicle.setStatus(VehicleStatus.IN_TRANSIT);
            } else if (vehicle.getStatus() == VehicleStatus.AVAILABLE) {
                vehicle.setStatus(VehicleStatus.ASSIGNED);
            }
            vehicleRepository.save(vehicle);
        }

        Shipment saved = shipmentRepository.save(shipment);
        log.info("Assigned vehicle {} to shipment {}", vehicle.getVehicleNumber(), saved.getTrackingNumber());
        return convertToDto(saved, true);
    }"""

new_assign_vehicle = """    public AdminShipmentDTO assignVehicle(Long shipmentId, Long vehicleId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + shipmentId));

        if (vehicleId == null) {
            // Unassigning vehicle
            Vehicle prevVehicle = shipment.getVehicle();
            shipment.setVehicle(null);
            shipment.setUpdatedAt(LocalDateTime.now());
            Shipment saved = shipmentRepository.save(shipment);

            if (prevVehicle != null) {
                List<Shipment> remainingActive = shipmentRepository.findActiveShipmentsByVehicle(prevVehicle);
                if (remainingActive.isEmpty() && prevVehicle.getStatus() != VehicleStatus.INACTIVE && prevVehicle.getStatus() != VehicleStatus.MAINTENANCE) {
                    prevVehicle.setStatus(prevVehicle.getAssignedDriver() != null ? VehicleStatus.ASSIGNED : VehicleStatus.AVAILABLE);
                    vehicleRepository.save(prevVehicle);
                }
            }
            log.info("Vehicle unassigned from shipment {}", shipment.getTrackingNumber());
            return convertToDto(saved, true);
        }

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + vehicleId));

        if (vehicle.getStatus() == VehicleStatus.INACTIVE) {
            throw new IllegalArgumentException("Cannot assign inactive vehicle " + vehicle.getVehicleNumber() + " to shipment.");
        }
        if (vehicle.getStatus() == VehicleStatus.MAINTENANCE) {
            throw new IllegalArgumentException("Cannot assign vehicle " + vehicle.getVehicleNumber() + " undergoing maintenance.");
        }

        Driver assignedDriver = vehicle.getAssignedDriver();
        if (assignedDriver == null) {
            throw new IllegalArgumentException("Vehicle " + vehicle.getVehicleNumber() + " does not have an assigned driver.");
        }

        // Business rule check: A vehicle should not have more than one active shipment at the same time.
        List<Shipment> activeShipments = shipmentRepository.findActiveShipmentsByVehicle(vehicle);
        boolean hasOtherActive = activeShipments.stream().anyMatch(s -> !s.getId().equals(shipmentId));
        if (hasOtherActive) {
            Shipment activeOnVeh = activeShipments.stream().filter(s -> !s.getId().equals(shipmentId)).findFirst().get();
            throw new IllegalArgumentException("Vehicle " + vehicle.getVehicleNumber() + " is currently assigned to an active shipment (" + activeOnVeh.getTrackingNumber() + ").");
        }

        // Driver consistency check:
        if (shipment.getDriver() != null) {
            if (!assignedDriver.getId().equals(shipment.getDriver().getId())) {
                throw new IllegalArgumentException("Vehicle " + vehicle.getVehicleNumber() + " is assigned to " + assignedDriver.getFullName() + " and cannot be assigned to another driver.");
            }
        } else {
            // Auto-bind vehicle's assigned driver to the shipment
            List<Shipment> activeDriverShipments = shipmentRepository.findActiveShipmentsByDriver(assignedDriver);
            boolean hasOtherDriverActive = activeDriverShipments.stream().anyMatch(s -> !s.getId().equals(shipmentId));
            if (hasOtherDriverActive) {
                Shipment activeOnDriver = activeDriverShipments.stream().filter(s -> !s.getId().equals(shipmentId)).findFirst().get();
                throw new IllegalArgumentException("Driver " + assignedDriver.getFullName() + " is currently assigned to an active shipment (" + activeOnDriver.getTrackingNumber() + ").");
            }
            shipment.setDriver(assignedDriver);
            if (shipment.getStatus() != OrderStatus.DELIVERED && shipment.getStatus() != OrderStatus.CANCELLED) {
                assignedDriver.setStatus(DriverStatus.ON_TRIP);
                driverRepository.save(assignedDriver);
            }
        }

        // Previous vehicle cleanup if reassigning
        Vehicle prevVehicle = shipment.getVehicle();
        if (prevVehicle != null && !prevVehicle.getId().equals(vehicle.getId())) {
            List<Shipment> remaining = shipmentRepository.findActiveShipmentsByVehicle(prevVehicle);
            boolean prevHasOther = remaining.stream().anyMatch(s -> !s.getId().equals(shipmentId));
            if (!prevHasOther && prevVehicle.getStatus() != VehicleStatus.INACTIVE && prevVehicle.getStatus() != VehicleStatus.MAINTENANCE) {
                prevVehicle.setStatus(prevVehicle.getAssignedDriver() != null ? VehicleStatus.ASSIGNED : VehicleStatus.AVAILABLE);
                vehicleRepository.save(prevVehicle);
            }
        }

        shipment.setVehicle(vehicle);
        shipment.setUpdatedAt(LocalDateTime.now());

        // Status synchronization:
        if (shipment.getStatus() != OrderStatus.DELIVERED && shipment.getStatus() != OrderStatus.CANCELLED) {
            if (shipment.getStatus() == OrderStatus.IN_TRANSIT || shipment.getStatus() == OrderStatus.OUT_FOR_DELIVERY) {
                vehicle.setStatus(VehicleStatus.IN_TRANSIT);
            } else if (vehicle.getStatus() == VehicleStatus.AVAILABLE) {
                vehicle.setStatus(VehicleStatus.ASSIGNED);
            }
            vehicleRepository.save(vehicle);
        }

        Shipment saved = shipmentRepository.save(shipment);
        log.info("Assigned vehicle {} to shipment {}", vehicle.getVehicleNumber(), saved.getTrackingNumber());
        return convertToDto(saved, true);
    }"""

assert old_assign_vehicle in content, "old_assign_vehicle not found in content!"
content = content.replace(old_assign_vehicle, new_assign_vehicle)
print("Replaced assignVehicle logic.")

# 3. Target block for assignDriver
old_assign_driver = """    public AdminShipmentDTO assignDriver(Long shipmentId, Long driverId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + shipmentId));

        Driver prevDriver = shipment.getDriver();

        if (driverId == null) {
            // Unassigning driver
            shipment.setDriver(null);
            shipment.setUpdatedAt(LocalDateTime.now());
            Shipment saved = shipmentRepository.save(shipment);

            if (shipment.getVehicle() != null) {
                Vehicle v = shipment.getVehicle();
                v.setAssignedDriver(null);
                vehicleRepository.save(v);
            }

            if (prevDriver != null) {
                List<Shipment> remainingActive = shipmentRepository.findActiveShipmentsByDriver(prevDriver);
                if (remainingActive.isEmpty() && prevDriver.getStatus() != DriverStatus.INACTIVE) {
                    prevDriver.setStatus(DriverStatus.AVAILABLE);
                    driverRepository.save(prevDriver);
                }
            }
            log.info("Driver unassigned from shipment {}", shipment.getTrackingNumber());
            return convertToDto(saved, true);
        }

        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + driverId));

        if (driver.getStatus() == DriverStatus.INACTIVE) {
            throw new IllegalArgumentException("Cannot assign inactive driver " + driver.getFullName() + " to shipment.");
        }

        List<Shipment> activeShipments = shipmentRepository.findActiveShipmentsByDriver(driver);
        boolean hasOtherActive = activeShipments.stream().anyMatch(s -> !s.getId().equals(shipmentId));
        if (hasOtherActive) {
            throw new IllegalArgumentException("Driver " + driver.getFullName() + " is already assigned to active shipment " + activeShipments.get(0).getTrackingNumber() + ".");
        }

        shipment.setDriver(driver);
        shipment.setUpdatedAt(LocalDateTime.now());

        if (shipment.getStatus() != OrderStatus.DELIVERED && shipment.getStatus() != OrderStatus.CANCELLED) {
            driver.setStatus(DriverStatus.ON_TRIP);
            driverRepository.save(driver);
        }

        if (shipment.getVehicle() != null) {
            Vehicle v = shipment.getVehicle();
            v.setAssignedDriver(driver);
            vehicleRepository.save(v);
        }

        if (prevDriver != null && !prevDriver.getId().equals(driver.getId())) {
            List<Shipment> remainingActive = shipmentRepository.findActiveShipmentsByDriver(prevDriver);
            boolean prevHasOther = remainingActive.stream().anyMatch(s -> !s.getId().equals(shipmentId));
            if (!prevHasOther && prevDriver.getStatus() != DriverStatus.INACTIVE) {
                prevDriver.setStatus(DriverStatus.AVAILABLE);
                driverRepository.save(prevDriver);
            }
        }

        Shipment saved = shipmentRepository.save(shipment);
        log.info("Driver {} (ID: {}) assigned to shipment {}", driver.getFullName(), driver.getId(), shipment.getTrackingNumber());
        return convertToDto(saved, true);
    }"""

new_assign_driver = """    public AdminShipmentDTO assignDriver(Long shipmentId, Long driverId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + shipmentId));

        Driver prevDriver = shipment.getDriver();

        if (driverId == null) {
            // Unassigning driver
            shipment.setDriver(null);
            shipment.setUpdatedAt(LocalDateTime.now());
            Shipment saved = shipmentRepository.save(shipment);

            // Note: We do NOT clear vehicle.assignedDriver. That relationship belongs to fleet configuration.

            if (prevDriver != null) {
                List<Shipment> remainingActive = shipmentRepository.findActiveShipmentsByDriver(prevDriver);
                if (remainingActive.isEmpty() && prevDriver.getStatus() != DriverStatus.INACTIVE) {
                    prevDriver.setStatus(DriverStatus.AVAILABLE);
                    driverRepository.save(prevDriver);
                }
            }
            log.info("Driver unassigned from shipment {}", shipment.getTrackingNumber());
            return convertToDto(saved, true);
        }

        Driver driver = driverRepository.findById(driverId)
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
        }

        shipment.setDriver(driver);
        shipment.setUpdatedAt(LocalDateTime.now());

        if (shipment.getStatus() != OrderStatus.DELIVERED && shipment.getStatus() != OrderStatus.CANCELLED) {
            driver.setStatus(DriverStatus.ON_TRIP);
            driverRepository.save(driver);
        }

        if (prevDriver != null && !prevDriver.getId().equals(driver.getId())) {
            List<Shipment> remainingActive = shipmentRepository.findActiveShipmentsByDriver(prevDriver);
            boolean prevHasOther = remainingActive.stream().anyMatch(s -> !s.getId().equals(shipmentId));
            if (!prevHasOther && prevDriver.getStatus() != DriverStatus.INACTIVE) {
                prevDriver.setStatus(DriverStatus.AVAILABLE);
                driverRepository.save(prevDriver);
            }
        }

        Shipment saved = shipmentRepository.save(shipment);
        log.info("Driver {} (ID: {}) assigned to shipment {}", driver.getFullName(), driver.getId(), shipment.getTrackingNumber());
        return convertToDto(saved, true);
    }"""

assert old_assign_driver in content, "old_assign_driver not found in content!"
content = content.replace(old_assign_driver, new_assign_driver)
print("Replaced assignDriver logic.")

with open(service_path, "w", encoding="utf-8") as f:
    f.write(content)
print("AdminShipmentService.java successfully updated.")
