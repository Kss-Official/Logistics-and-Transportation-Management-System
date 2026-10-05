const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

// 1. Update WarehouseManagerController.java
const controllerPath = path.join(BACKEND_BASE, 'controller', 'WarehouseManagerController.java');
let controllerContent = fs.readFileSync(controllerPath, 'utf8');

controllerContent = controllerContent.replace(
    '@PostMapping("/shipments/{id}/assign")',
    '@PostMapping({"/shipments/{id}/assign", "/shipments/{id}/assign-fleet"})'
);
fs.writeFileSync(controllerPath, controllerContent, 'utf8');
console.log('Updated WarehouseManagerController.java');

// 2. Update WarehouseManagerService.java
const servicePath = path.join(BACKEND_BASE, 'service', 'WarehouseManagerService.java');
let serviceContent = fs.readFileSync(servicePath, 'utf8');

// Replace assignFleet method
const assignFleetRegex = /public WarehouseShipmentDTO assignFleet\(Long id, AssignFleetRequest request\) \{[\s\S]*?\n    \}/;

const newAssignFleet = `public WarehouseShipmentDTO assignFleet(Long id, AssignFleetRequest request) {
        User user = getAuthenticatedUser();
        if (user == null || (user.getRole() != Role.WAREHOUSE_MANAGER && user.getRole() != Role.ADMIN)) {
            throw new AccessDeniedException("Only Warehouse Managers can perform standard operational fleet assignments.");
        }
        Warehouse warehouse = getScopedWarehouse();
        String performer = user.getRole() == Role.ADMIN
                ? "Administrator (" + user.getFullName() + ")"
                : "Warehouse Manager (" + user.getFullName() + ")";

        if (request == null || request.getDriverId() == null || request.getVehicleId() == null) {
            throw new IllegalArgumentException("Both Driver and Vehicle must be selected for fleet assignment.");
        }

        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found: " + id));

        if (shipment.getOriginWarehouse() == null || !shipment.getOriginWarehouse().getId().equals(warehouse.getId())) {
            throw new AccessDeniedException("Unauthorized: Driver and vehicle assignments are restricted to the origin warehouse (" + warehouse.getWarehouseCode() + ").");
        }

        if (shipment.getStatus() == OrderStatus.CANCELLED || "CANCELLED".equalsIgnoreCase(shipment.getOperationalStage())) {
            throw new IllegalStateException("Cannot assign fleet to a cancelled shipment.");
        }

        if (shipment.getStatus() == OrderStatus.DELIVERED || "DELIVERED".equalsIgnoreCase(shipment.getOperationalStage())) {
            throw new IllegalStateException("Cannot assign fleet to a delivered shipment.");
        }

        String currentStage = shipment.getOperationalStage() != null ? shipment.getOperationalStage().trim().toUpperCase() : "READY_FOR_PROCESSING";
        if (!"PACKED".equals(currentStage)) {
            throw new IllegalStateException("Shipment must be in PACKED stage before fleet assignment. Current stage: " + currentStage);
        }

        // Driver Validation & Assignment
        Driver driver = driverRepository.findById(request.getDriverId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found: " + request.getDriverId()));

        if (driver.getWarehouse() == null || !driver.getWarehouse().getId().equals(warehouse.getId())) {
            throw new IllegalArgumentException("Driver " + driver.getFullName() + " does not belong to warehouse " + warehouse.getWarehouseCode() + ".");
        }

        if (driver.getStatus() == DriverStatus.INACTIVE) {
            throw new IllegalArgumentException("Cannot assign inactive driver: " + driver.getFullName() + ".");
        }
        if (driver.getStatus() == DriverStatus.OFF_DUTY) {
            throw new IllegalArgumentException("Cannot assign off-duty driver: " + driver.getFullName() + ".");
        }
        if (driver.getStatus() == DriverStatus.ON_TRIP) {
            List<Shipment> activeOnDriver = shipmentRepository.findActiveShipmentsByDriver(driver);
            String otherTrk = !activeOnDriver.isEmpty() ? activeOnDriver.get(0).getTrackingNumber() : "another trip";
            throw new IllegalArgumentException("Driver " + driver.getFullName() + " is currently on trip with shipment " + otherTrk + ".");
        }

        List<Shipment> activeOnDriver = shipmentRepository.findActiveShipmentsByDriver(driver);
        boolean driverHasOther = activeOnDriver.stream().anyMatch(s -> !s.getId().equals(shipment.getId()));
        if (driverHasOther) {
            Shipment other = activeOnDriver.stream().filter(s -> !s.getId().equals(shipment.getId())).findFirst().get();
            throw new IllegalArgumentException("Driver " + driver.getFullName() + " is currently on trip with shipment " + other.getTrackingNumber() + ".");
        }

        // Vehicle Validation & Assignment
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + request.getVehicleId()));

        if (vehicle.getWarehouse() == null || !vehicle.getWarehouse().getId().equals(warehouse.getId())) {
            throw new IllegalArgumentException("Vehicle " + vehicle.getVehicleNumber() + " does not belong to warehouse " + warehouse.getWarehouseCode() + ".");
        }

        if (vehicle.getStatus() == VehicleStatus.INACTIVE) {
            throw new IllegalArgumentException("Cannot assign inactive vehicle: " + vehicle.getVehicleNumber() + ".");
        }
        if (vehicle.getStatus() == VehicleStatus.MAINTENANCE) {
            throw new IllegalArgumentException("Cannot assign vehicle undergoing maintenance: " + vehicle.getVehicleNumber() + ".");
        }
        if (vehicle.getStatus() == VehicleStatus.IN_TRANSIT) {
            List<Shipment> activeOnVeh = shipmentRepository.findActiveShipmentsByVehicle(vehicle);
            String otherTrk = !activeOnVeh.isEmpty() ? activeOnVeh.get(0).getTrackingNumber() : "another trip";
            throw new IllegalArgumentException("Vehicle " + vehicle.getVehicleNumber() + " is currently in transit with shipment " + otherTrk + ".");
        }

        if (vehicle.getAssignedDriver() != null && !vehicle.getAssignedDriver().getId().equals(driver.getId())) {
            throw new IllegalArgumentException("Vehicle " + vehicle.getVehicleNumber() + " is configured for driver " + vehicle.getAssignedDriver().getFullName() + " and cannot be assigned to another driver.");
        }

        List<Shipment> activeOnVeh = shipmentRepository.findActiveShipmentsByVehicle(vehicle);
        boolean vehHasOther = activeOnVeh.stream().anyMatch(s -> !s.getId().equals(shipment.getId()));
        if (vehHasOther) {
            Shipment other = activeOnVeh.stream().filter(s -> !s.getId().equals(shipment.getId())).findFirst().get();
            throw new IllegalArgumentException("Vehicle " + vehicle.getVehicleNumber() + " is currently assigned to active shipment " + other.getTrackingNumber() + ".");
        }

        // Atomic assignment to shipment
        shipment.setDriver(driver);
        shipment.setVehicle(vehicle);
        shipment.setOperationalStage("READY_FOR_DISPATCH");
        shipment.setAssignmentStatus("ASSIGNED");
        shipment.setAssignedBy(performer);
        shipment.setAssignedAt(LocalDateTime.now());
        shipment.setUpdatedAt(LocalDateTime.now());

        // Update Driver & Vehicle Status
        driver.setStatus(DriverStatus.ON_TRIP);
        driverRepository.save(driver);

        vehicle.setStatus(VehicleStatus.ASSIGNED);
        vehicleRepository.save(vehicle);

        // Record tracking milestone event
        ShipmentTrackingEvent event = new ShipmentTrackingEvent(
                shipment,
                shipment.getStatus() != null ? shipment.getStatus() : OrderStatus.CONFIRMED,
                "Driver & Vehicle Assigned",
                warehouse.getWarehouseName() + ", " + warehouse.getCity(),
                "Driver " + driver.getFullName() + " and vehicle " + vehicle.getVehicleNumber() + " assigned for dispatch by " + performer + "."
        );
        trackingEventRepository.save(event);

        Shipment saved = shipmentRepository.save(shipment);
        return mapToShipmentDTO(saved);
    }`;

serviceContent = serviceContent.replace(assignFleetRegex, newAssignFleet);

// Also update getAvailableDrivers and getAvailableVehicles
const getAvailableDriversRegex = /public List<Driver> getAvailableDrivers\(\) \{[\s\S]*?\n    \}/;
const newGetAvailableDrivers = `public List<Driver> getAvailableDrivers() {
        Warehouse warehouse = getScopedWarehouse();
        return driverRepository.findAll().stream()
                .filter(d -> d.getWarehouse() != null && d.getWarehouse().getId().equals(warehouse.getId()))
                .filter(d -> d.getStatus() == DriverStatus.AVAILABLE)
                .filter(d -> shipmentRepository.findActiveShipmentsByDriver(d).isEmpty())
                .collect(Collectors.toList());
    }`;

const getAvailableVehiclesRegex = /public List<Vehicle> getAvailableVehicles\(\) \{[\s\S]*?\n    \}/;
const newGetAvailableVehicles = `public List<Vehicle> getAvailableVehicles() {
        Warehouse warehouse = getScopedWarehouse();
        return vehicleRepository.findAll().stream()
                .filter(v -> v.getWarehouse() != null && v.getWarehouse().getId().equals(warehouse.getId()))
                .filter(v -> v.getStatus() == VehicleStatus.AVAILABLE)
                .filter(v -> shipmentRepository.findActiveShipmentsByVehicle(v).isEmpty())
                .collect(Collectors.toList());
    }`;

serviceContent = serviceContent.replace(getAvailableDriversRegex, newGetAvailableDrivers);
serviceContent = serviceContent.replace(getAvailableVehiclesRegex, newGetAvailableVehicles);

fs.writeFileSync(servicePath, serviceContent, 'utf8');
console.log('Updated WarehouseManagerService.java');
