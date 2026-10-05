const fs = require('fs');
const path = require('path');

const file = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/service/AdminShipmentService.java';
let content = fs.readFileSync(file, 'utf8');

const assignVehicleCode = `    public AdminShipmentDTO assignVehicle(Long shipmentId, Long vehicleId) {
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
    }
`;

const assignDriverCode = `    public AdminShipmentDTO assignDriver(Long shipmentId, Long driverId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + shipmentId));

        Driver prevDriver = shipment.getDriver();

        if (driverId == null) {
            // Unassigning driver
            shipment.setDriver(null);
            shipment.setUpdatedAt(LocalDateTime.now());
            Shipment saved = shipmentRepository.save(shipment);

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
    }
`;

const updateStatusMethod = `    @Transactional
    public AdminShipmentDTO updateShipmentStatus(Long id, OrderStatus newStatus, String locationName, String description) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + id));

        OrderStatus oldStatus = shipment.getStatus();
        shipment.setStatus(newStatus);
        if (locationName != null && !locationName.isBlank()) {
            shipment.setCurrentLocationName(locationName.trim());
        }
        shipment.setUpdatedAt(LocalDateTime.now());

        // Sync order status
        if (shipment.getOrder() != null) {
            Order order = shipment.getOrder();
            order.setStatus(newStatus);
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);
        }

        // If shipment is DELIVERED or CANCELLED, free the assigned driver and vehicle back to AVAILABLE if no other active shipments
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
            }
            if (shipment.getVehicle() != null) {
                Vehicle vehicle = shipment.getVehicle();
                List<Shipment> remainingActiveVeh = shipmentRepository.findActiveShipmentsByVehicle(vehicle);
                boolean hasOtherVehActive = remainingActiveVeh.stream().anyMatch(s -> !s.getId().equals(shipment.getId()));
                if (!hasOtherVehActive && vehicle.getStatus() != VehicleStatus.INACTIVE && vehicle.getStatus() != VehicleStatus.MAINTENANCE) {
                    vehicle.setStatus(vehicle.getAssignedDriver() != null ? VehicleStatus.ASSIGNED : VehicleStatus.AVAILABLE);
                    vehicleRepository.save(vehicle);
                    log.info("Vehicle {} (ID: {}) transitioned as shipment {} completed.",
                            vehicle.getVehicleNumber(), vehicle.getId(), shipment.getTrackingNumber());
                }
            }
        }

        // Tracking milestone event
        String eventTitle = "Shipment Status Updated to " + newStatus.name();
        String loc = locationName != null && !locationName.isBlank() ? locationName.trim() : (shipment.getCurrentLocationName() != null ? shipment.getCurrentLocationName() : "In Transit Hub");
        String desc = description != null && !description.isBlank() ? description.trim() : ("Status transitioned from " + oldStatus + " to " + newStatus);

        ShipmentTrackingEvent event = new ShipmentTrackingEvent(
                shipment,
                newStatus,
                eventTitle,
                loc,
                desc
        );
        eventRepository.save(event);

        Shipment saved = shipmentRepository.save(shipment);
        return convertToDto(saved, true);
    }
`;

// Insert assignVehicle, assignDriver right before updateShipment
const updateMarker = "    public AdminShipmentDTO updateShipment(";
content = content.replace(updateMarker, assignVehicleCode + "\n" + assignDriverCode + "\n" + updateMarker);

// Insert updateShipmentStatus right after updateShipment method
const unassignedMarker = "    public List<AdminOrderResponseDTO> getUnassignedOrders() {";
content = content.replace(unassignedMarker, updateStatusMethod + "\n" + unassignedMarker);

fs.writeFileSync(file, content, 'utf8');
console.log("Restored assignVehicle, assignDriver, and updateShipmentStatus in AdminShipmentService.java");
