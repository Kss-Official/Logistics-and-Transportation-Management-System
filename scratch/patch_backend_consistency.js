const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics';

// ==========================================
// 1. ADMIN VEHICLE SERVICE
// ==========================================
const vehServicePath = path.join(BACKEND_BASE, 'service/AdminVehicleService.java');
let vehCode = fs.readFileSync(vehServicePath, 'utf8');

// Replace assignDriver
const assignDriverStart = 'public VehicleDTO assignDriver(Long id, AssignDriverRequest req) {';
const assignDriverEnd = 'return convertToDTO(saved);\n    }';
const assignDriverIdx = vehCode.indexOf(assignDriverStart);
if (assignDriverIdx !== -1) {
  const assignDriverEndIdx = vehCode.indexOf(assignDriverEnd, assignDriverIdx);
  if (assignDriverEndIdx !== -1) {
    const fullEnd = assignDriverEndIdx + assignDriverEnd.length;
    const newAssignDriverCode = `public VehicleDTO assignDriver(Long id, AssignDriverRequest req) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));

        if (vehicle.getStatus() == VehicleStatus.MAINTENANCE || vehicle.getStatus() == VehicleStatus.INACTIVE) {
            throw new IllegalArgumentException("Cannot assign driver to vehicle while its status is " + vehicle.getStatus() + ". Set vehicle to AVAILABLE first.");
        }

        List<Shipment> activeShipments = shipmentRepository.findActiveShipmentsByVehicle(vehicle);

        if (req.getDriverId() == null) {
            // Unassign driver from vehicle
            vehicle.setAssignedDriver(null);
            if (activeShipments.isEmpty() && vehicle.getStatus() == VehicleStatus.ASSIGNED) {
                vehicle.setStatus(VehicleStatus.AVAILABLE);
            }
            // If vehicle currently has an active shipment, unassign driver from the active shipment as well
            if (!activeShipments.isEmpty()) {
                Shipment s = activeShipments.get(0);
                Driver prevDriver = s.getDriver();
                s.setDriver(null);
                s.setUpdatedAt(LocalDateTime.now());
                shipmentRepository.save(s);
                if (prevDriver != null) {
                    List<Shipment> remaining = shipmentRepository.findActiveShipmentsByDriver(prevDriver);
                    if (remaining.isEmpty() && prevDriver.getStatus() != DriverStatus.INACTIVE) {
                        prevDriver.setStatus(DriverStatus.AVAILABLE);
                        driverRepository.save(prevDriver);
                    }
                }
            }
        } else {
            Driver driver = driverRepository.findById(req.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + req.getDriverId()));

            List<Vehicle> otherVehicles = vehicleRepository.findByAssignedDriverAndIdNot(driver, id);
            if (!otherVehicles.isEmpty()) {
                throw new IllegalArgumentException("Driver " + driver.getFullName() + " is already assigned to vehicle " + otherVehicles.get(0).getVehicleNumber() + ".");
            }

            // Verify driver is not already assigned to another active shipment
            List<Shipment> driverActive = shipmentRepository.findActiveShipmentsByDriver(driver);
            boolean driverOnOther = driverActive.stream().anyMatch(s -> activeShipments.isEmpty() || !s.getId().equals(activeShipments.get(0).getId()));
            if (driverOnOther) {
                throw new IllegalArgumentException("Driver " + driver.getFullName() + " is already assigned to active shipment " + driverActive.get(0).getTrackingNumber() + ".");
            }

            vehicle.setAssignedDriver(driver);
            if (vehicle.getStatus() == VehicleStatus.AVAILABLE) {
                vehicle.setStatus(VehicleStatus.ASSIGNED);
            }

            // Synchronize active shipment driver on this vehicle
            if (!activeShipments.isEmpty()) {
                Shipment s = activeShipments.get(0);
                Driver prevDriver = s.getDriver();
                s.setDriver(driver);
                s.setUpdatedAt(LocalDateTime.now());
                shipmentRepository.save(s);

                driver.setStatus(DriverStatus.ON_TRIP);
                driverRepository.save(driver);

                if (prevDriver != null && !prevDriver.getId().equals(driver.getId())) {
                    List<Shipment> remaining = shipmentRepository.findActiveShipmentsByDriver(prevDriver);
                    if (remaining.isEmpty() && prevDriver.getStatus() != DriverStatus.INACTIVE) {
                        prevDriver.setStatus(DriverStatus.AVAILABLE);
                        driverRepository.save(prevDriver);
                    }
                }
            }
        }

        Vehicle saved = vehicleRepository.save(vehicle);
        return convertToDTO(saved);
    }`;
    vehCode = vehCode.slice(0, assignDriverIdx) + newAssignDriverCode + vehCode.slice(fullEnd);
    console.log('Successfully replaced assignDriver in AdminVehicleService');
  }
}

// Replace convertToDTO in AdminVehicleService
const convertToDTOStart = 'private VehicleDTO convertToDTO(Vehicle v) {';
const convertToDTOEnd = 'return dto;\n    }';
const convertToDTOIdx = vehCode.indexOf(convertToDTOStart);
if (convertToDTOIdx !== -1) {
  const convertToDTOEndIdx = vehCode.indexOf(convertToDTOEnd, convertToDTOIdx);
  if (convertToDTOEndIdx !== -1) {
    const fullEnd = convertToDTOEndIdx + convertToDTOEnd.length;
    const newConvertToDTOCode = `private VehicleDTO convertToDTO(Vehicle v) {
        VehicleDTO dto = new VehicleDTO();
        dto.setId(v.getId());
        dto.setVehicleNumber(v.getVehicleNumber());
        dto.setVehicleType(v.getVehicleType());
        dto.setManufacturer(v.getManufacturer() != null ? v.getManufacturer() : "");
        dto.setModel(v.getModel());
        dto.setCapacity(v.getCapacity());
        dto.setCapacityUnit(v.getCapacityUnit() != null ? v.getCapacityUnit() : "TONS");
        dto.setRegistrationNumber(v.getRegistrationNumber());
        dto.setRegistrationExpiry(v.getRegistrationExpiry());
        dto.setInsuranceExpiry(v.getInsuranceExpiry());
        dto.setStatus(v.getStatus());
        dto.setCurrentLocation(v.getCurrentLocation() != null ? v.getCurrentLocation() : "");
        dto.setCreatedAt(v.getCreatedAt());
        dto.setUpdatedAt(v.getUpdatedAt());

        // Active shipment details
        List<Shipment> activeShipments = shipmentRepository.findActiveShipmentsByVehicle(v);
        Driver activeDriver = null;
        if (!activeShipments.isEmpty()) {
            Shipment s = activeShipments.get(0);
            dto.setCurrentShipmentId(s.getId());
            dto.setCurrentShipmentTrackingNumber(s.getTrackingNumber());
            dto.setCurrentShipmentOrderNumber(s.getOrder() != null ? s.getOrder().getOrderNumber() : null);
            dto.setCurrentShipmentStatus(s.getStatus() != null ? s.getStatus().name() : "IN_TRANSIT");

            if (s.getOrder() != null) {
                if (s.getOrder().getPickupAddress() != null) {
                    dto.setCurrentShipmentOrigin(s.getOrder().getPickupAddress().getCity());
                }
                if (s.getOrder().getDeliveryAddress() != null) {
                    dto.setCurrentShipmentDestination(s.getOrder().getDeliveryAddress().getCity());
                }
            }

            if (s.getDriver() != null) {
                activeDriver = s.getDriver();
            }
        } else {
            dto.setCurrentShipmentTrackingNumber("No active shipment");
        }

        // Operational Driver details: The active shipment's driver is the single authoritative driver for the vehicle
        Driver effectiveDriver = activeDriver != null ? activeDriver : v.getAssignedDriver();
        if (effectiveDriver != null) {
            dto.setDriverId(effectiveDriver.getId());
            dto.setDriverName(effectiveDriver.getFullName());
            dto.setDriverPhone(effectiveDriver.getPhone());
        } else {
            dto.setDriverName("Not Assigned");
        }

        return dto;
    }`;
    vehCode = vehCode.slice(0, convertToDTOIdx) + newConvertToDTOCode + vehCode.slice(fullEnd);
    console.log('Successfully replaced convertToDTO in AdminVehicleService');
  }
}
fs.writeFileSync(vehServicePath, vehCode, 'utf8');

// ==========================================
// 2. ADMIN SHIPMENT SERVICE
// ==========================================
const shipmentServicePath = path.join(BACKEND_BASE, 'service/AdminShipmentService.java');
let shipmentCode = fs.readFileSync(shipmentServicePath, 'utf8');

// In createShipment: synchronize vehicle.setAssignedDriver(driver) if both driver and vehicle are assigned
const oldCreateVehBlock = `            shipment.setVehicle(vehicle);
            if (vehicle.getStatus() == VehicleStatus.AVAILABLE) {
                vehicle.setStatus(VehicleStatus.ASSIGNED);
            }
            vehicleRepository.save(vehicle);`;

const newCreateVehBlock = `            shipment.setVehicle(vehicle);
            if (driverId != null) {
                Driver dObj = driverRepository.findById(driverId).orElse(null);
                if (dObj != null) {
                    vehicle.setAssignedDriver(dObj);
                }
            }
            if (vehicle.getStatus() == VehicleStatus.AVAILABLE) {
                vehicle.setStatus(VehicleStatus.ASSIGNED);
            }
            vehicleRepository.save(vehicle);`;

if (shipmentCode.includes(oldCreateVehBlock)) {
  shipmentCode = shipmentCode.replace(oldCreateVehBlock, newCreateVehBlock);
  console.log('Synchronized vehicle.assignedDriver in createShipment');
}

// In assignVehicle: synchronize vehicle.setAssignedDriver(shipment.getDriver())
const oldAssignVehSync = `        shipment.setVehicle(vehicle);
        shipment.setUpdatedAt(LocalDateTime.now());`;

const newAssignVehSync = `        shipment.setVehicle(vehicle);
        shipment.setUpdatedAt(LocalDateTime.now());

        // Keep vehicle and shipment driver synchronized
        if (shipment.getDriver() != null) {
            vehicle.setAssignedDriver(shipment.getDriver());
            vehicleRepository.save(vehicle);
        } else if (vehicle.getAssignedDriver() != null) {
            shipment.setDriver(vehicle.getAssignedDriver());
            if (shipment.getStatus() != OrderStatus.DELIVERED && shipment.getStatus() != OrderStatus.CANCELLED) {
                vehicle.getAssignedDriver().setStatus(DriverStatus.ON_TRIP);
                driverRepository.save(vehicle.getAssignedDriver());
            }
        }`;

if (shipmentCode.includes(oldAssignVehSync)) {
  shipmentCode = shipmentCode.replace(oldAssignVehSync, newAssignVehSync);
  console.log('Synchronized vehicle.assignedDriver in assignVehicle');
}

// Add assignDriver method to AdminShipmentService
if (!shipmentCode.includes('public AdminShipmentDTO assignDriver(Long shipmentId, Long driverId)')) {
  const targetInsertion = '// ==========================================\n    // 5. UPDATE SHIPMENT STATUS';
  const newAssignDriverMethod = `// ==========================================
    // 4B. ASSIGN / UNASSIGN DRIVER TO SHIPMENT
    // ==========================================
    public AdminShipmentDTO assignDriver(Long shipmentId, Long driverId) {
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
    }

    // ==========================================
    // 5. UPDATE SHIPMENT STATUS`;

  shipmentCode = shipmentCode.replace(targetInsertion, newAssignDriverMethod);
  console.log('Added assignDriver method to AdminShipmentService');
}
fs.writeFileSync(shipmentServicePath, shipmentCode, 'utf8');

// ==========================================
// 3. ADMIN SHIPMENT CONTROLLER
// ==========================================
const shipmentCtrlPath = path.join(BACKEND_BASE, 'controller/AdminShipmentController.java');
let ctrlCode = fs.readFileSync(shipmentCtrlPath, 'utf8');

if (!ctrlCode.includes('@PatchMapping("/{id}/driver")')) {
  const targetPatch = `@PatchMapping("/{id}/vehicle")
    public ResponseEntity<ApiResponse<AdminShipmentDTO>> assignVehicle(
            @PathVariable Long id,
            @RequestBody AssignVehicleRequest request) {
        AdminShipmentDTO updated = adminShipmentService.assignVehicle(id, request.getVehicleId());
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Vehicle assignment updated successfully", updated)
        );
    }`;

  const newPatches = targetPatch + `\n\n    @PatchMapping("/{id}/driver")
    public ResponseEntity<ApiResponse<AdminShipmentDTO>> assignDriver(
            @PathVariable Long id,
            @RequestBody AssignDriverRequest request) {
        AdminShipmentDTO updated = adminShipmentService.assignDriver(id, request.getDriverId());
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Driver assignment updated successfully", updated)
        );
    }`;

  ctrlCode = ctrlCode.replace(targetPatch, newPatches);
  fs.writeFileSync(shipmentCtrlPath, ctrlCode, 'utf8');
  console.log('Added @PatchMapping("/{id}/driver") to AdminShipmentController');
}

// ==========================================
// 4. ADMIN ROUTE SERVICE
// ==========================================
const routeServicePath = path.join(BACKEND_BASE, 'service/AdminRouteService.java');
let routeCode = fs.readFileSync(routeServicePath, 'utf8');

const oldRouteDriverBlock = `        if (route.getDriver() != null) {
            dto.setDriverId(route.getDriver().getId());
            dto.setDriverName(route.getDriver().getFullName());
            dto.setDriverPhone(route.getDriver().getPhone());
            dto.setDriverStatus(route.getDriver().getStatus());
        }

        if (route.getVehicle() != null) {
            dto.setVehicleId(route.getVehicle().getId());
            dto.setVehicleNumber(route.getVehicle().getVehicleNumber());
            dto.setVehicleModel(route.getVehicle().getModel());
            dto.setVehicleType(route.getVehicle().getVehicleType());
            dto.setVehicleCapacity(route.getVehicle().getCapacity());
            dto.setVehicleCapacityUnit(route.getVehicle().getCapacityUnit());
        }

        long activeLoads = shipmentRepository.countActiveShipmentsByRoute(route);
        dto.setActiveLoads(activeLoads);
        dto.setTotalShipments(shipmentRepository.countByRoute(route));

        dto.setOriginLatitude(route.getOriginLatitude());
        dto.setOriginLongitude(route.getOriginLongitude());
        dto.setDestinationLatitude(route.getDestinationLatitude());
        dto.setDestinationLongitude(route.getDestinationLongitude());

        List<Shipment> activeShipments = shipmentRepository.findByRoute(route).stream()
                .filter(s -> s.getStatus() != OrderStatus.DELIVERED && s.getStatus() != OrderStatus.CANCELLED)
                .collect(Collectors.toList());`;

const newRouteDriverBlock = `        List<Shipment> activeShipments = shipmentRepository.findByRoute(route).stream()
                .filter(s -> s.getStatus() != OrderStatus.DELIVERED && s.getStatus() != OrderStatus.CANCELLED)
                .collect(Collectors.toList());

        Driver operationalDriver = route.getDriver();
        Vehicle operationalVehicle = route.getVehicle();

        if (!activeShipments.isEmpty()) {
            Shipment s = activeShipments.get(0);
            if (s.getDriver() != null) {
                operationalDriver = s.getDriver();
            }
            if (s.getVehicle() != null) {
                operationalVehicle = s.getVehicle();
            }
        }

        if (operationalDriver != null) {
            dto.setDriverId(operationalDriver.getId());
            dto.setDriverName(operationalDriver.getFullName());
            dto.setDriverPhone(operationalDriver.getPhone());
            dto.setDriverStatus(operationalDriver.getStatus());
        }

        if (operationalVehicle != null) {
            dto.setVehicleId(operationalVehicle.getId());
            dto.setVehicleNumber(operationalVehicle.getVehicleNumber());
            dto.setVehicleModel(operationalVehicle.getModel());
            dto.setVehicleType(operationalVehicle.getVehicleType());
            dto.setVehicleCapacity(operationalVehicle.getCapacity());
            dto.setVehicleCapacityUnit(operationalVehicle.getCapacityUnit());
        }

        long activeLoads = shipmentRepository.countActiveShipmentsByRoute(route);
        dto.setActiveLoads(activeLoads);
        dto.setTotalShipments(shipmentRepository.countByRoute(route));

        dto.setOriginLatitude(route.getOriginLatitude());
        dto.setOriginLongitude(route.getOriginLongitude());
        dto.setDestinationLatitude(route.getDestinationLatitude());
        dto.setDestinationLongitude(route.getDestinationLongitude());`;

if (routeCode.includes(oldRouteDriverBlock)) {
  routeCode = routeCode.replace(oldRouteDriverBlock, newRouteDriverBlock);
  fs.writeFileSync(routeServicePath, routeCode, 'utf8');
  console.log('Updated convertToDTO in AdminRouteService to use active shipment operational driver & vehicle');
} else {
  console.log('Notice: Could not find exact oldRouteDriverBlock in AdminRouteService (checking if already patched)');
}

console.log('All backend modifications applied successfully!');
