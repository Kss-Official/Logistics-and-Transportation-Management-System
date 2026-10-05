const fs = require('fs');
const basePath = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics';

// 1. Driver.java
console.log('Updating Driver.java...');
let driverCode = fs.readFileSync(basePath + '/entity/Driver.java', 'utf8');
if (!driverCode.includes('import com.fasterxml.jackson.annotation.JsonIgnore;')) {
    driverCode = driverCode.replace('import jakarta.persistence.*;', 'import jakarta.persistence.*;\nimport com.fasterxml.jackson.annotation.JsonIgnore;');
}
if (!driverCode.includes('@JsonIgnore\n    @OneToMany(mappedBy = "driver"')) {
    driverCode = driverCode.replace(
        '@OneToMany(mappedBy = "driver", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)\n    private List<Shipment> shipments = new ArrayList<>();',
        '@JsonIgnore\n    @OneToMany(mappedBy = "driver", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)\n    private List<Shipment> shipments = new ArrayList<>();'
    );
}
fs.writeFileSync(basePath + '/entity/Driver.java', driverCode, 'utf8');
console.log('Driver.java updated.');

// 2. Vehicle.java
console.log('Updating Vehicle.java...');
let vehicleCode = fs.readFileSync(basePath + '/entity/Vehicle.java', 'utf8');
if (!vehicleCode.includes('import com.fasterxml.jackson.annotation.JsonIgnore;')) {
    vehicleCode = vehicleCode.replace('import jakarta.persistence.*;', 'import jakarta.persistence.*;\nimport com.fasterxml.jackson.annotation.JsonIgnore;');
}
if (!vehicleCode.includes('@JsonIgnore\n    @OneToMany(mappedBy = "vehicle"')) {
    vehicleCode = vehicleCode.replace(
        '@OneToMany(mappedBy = "vehicle", fetch = FetchType.LAZY)\n    private List<Shipment> shipments = new ArrayList<>();',
        '@JsonIgnore\n    @OneToMany(mappedBy = "vehicle", fetch = FetchType.LAZY)\n    private List<Shipment> shipments = new ArrayList<>();'
    );
}
fs.writeFileSync(basePath + '/entity/Vehicle.java', vehicleCode, 'utf8');
console.log('Vehicle.java updated.');

// 3. ShipmentRepository.java
console.log('Updating ShipmentRepository.java...');
let repoCode = fs.readFileSync(basePath + '/repository/ShipmentRepository.java', 'utf8');
if (!repoCode.includes('findIncomingShipmentsForWarehouse')) {
    repoCode = repoCode.replace(
        'List<Shipment> findByDestinationWarehouseOrderByCreatedAtDesc(Warehouse destinationWarehouse);',
        `List<Shipment> findByDestinationWarehouseOrderByCreatedAtDesc(Warehouse destinationWarehouse);

    @Query("SELECT s FROM Shipment s WHERE s.destinationWarehouse = :warehouse AND (s.originWarehouse IS NULL OR s.originWarehouse != :warehouse) ORDER BY s.createdAt DESC")
    List<Shipment> findIncomingShipmentsForWarehouse(@Param("warehouse") Warehouse warehouse);`
    );
}
// Also update findActiveIncomingByWarehouse to exclude originWarehouse == warehouse
repoCode = repoCode.replace(
    '@Query("SELECT s FROM Shipment s WHERE s.destinationWarehouse = :warehouse AND s.status != com.primeroute.logistics.entity.OrderStatus.DELIVERED ORDER BY s.createdAt DESC")\n    List<Shipment> findActiveIncomingByWarehouse(@Param("warehouse") Warehouse warehouse);',
    '@Query("SELECT s FROM Shipment s WHERE s.destinationWarehouse = :warehouse AND (s.originWarehouse IS NULL OR s.originWarehouse != :warehouse) AND s.status != com.primeroute.logistics.entity.OrderStatus.DELIVERED AND s.status != com.primeroute.logistics.entity.OrderStatus.CANCELLED ORDER BY s.createdAt DESC")\n    List<Shipment> findActiveIncomingByWarehouse(@Param("warehouse") Warehouse warehouse);'
);
fs.writeFileSync(basePath + '/repository/ShipmentRepository.java', repoCode, 'utf8');
console.log('ShipmentRepository.java updated.');

// 4. WarehouseManagerService.java
console.log('Updating WarehouseManagerService.java...');
let wmCode = fs.readFileSync(basePath + '/service/WarehouseManagerService.java', 'utf8');

// Update getIncomingShipments
wmCode = wmCode.replace(
    'public List<WarehouseShipmentDTO> getIncomingShipments() {\n        Warehouse warehouse = getScopedWarehouse();\n        List<Shipment> list = shipmentRepository.findByDestinationWarehouseOrderByCreatedAtDesc(warehouse);\n        return list.stream().map(this::mapToShipmentDTO).collect(Collectors.toList());\n    }',
    'public List<WarehouseShipmentDTO> getIncomingShipments() {\n        Warehouse warehouse = getScopedWarehouse();\n        List<Shipment> list = shipmentRepository.findIncomingShipmentsForWarehouse(warehouse);\n        return list.stream().map(this::mapToShipmentDTO).collect(Collectors.toList());\n    }'
);

// Update getShipmentById to allow both origin and destination warehouse managers
wmCode = wmCode.replace(
    'boolean isOrigin = shipment.getOriginWarehouse() != null && shipment.getOriginWarehouse().getId().equals(warehouse.getId());\n\n        if (!isOrigin) {\n            throw new AccessDeniedException("Unauthorized: Shipment does not belong to your assigned warehouse (" + warehouse.getWarehouseCode() + ").");\n        }',
    'boolean isOrigin = shipment.getOriginWarehouse() != null && shipment.getOriginWarehouse().getId().equals(warehouse.getId());\n        boolean isDestination = shipment.getDestinationWarehouse() != null && shipment.getDestinationWarehouse().getId().equals(warehouse.getId());\n\n        if (!isOrigin && !isDestination) {\n            throw new AccessDeniedException("Unauthorized: Shipment does not belong to your assigned warehouse (" + warehouse.getWarehouseCode() + ").");\n        }'
);

// Update dashboard fleet scoping
wmCode = wmCode.replace(
    '// Fleet KPIs\n        List<Driver> allDrivers = driverRepository.findAll();\n        long availDrivers = allDrivers.stream().filter(d -> d.getStatus() == DriverStatus.AVAILABLE).count();\n        dto.setDriversAvailableCount(availDrivers);\n        dto.setDriversTotalCount(allDrivers.size());\n\n        List<Vehicle> allVehicles = vehicleRepository.findAll();\n        long availVehicles = allVehicles.stream().filter(v -> v.getStatus() == VehicleStatus.AVAILABLE).count();\n        dto.setVehiclesAvailableCount(availVehicles);\n        dto.setVehiclesTotalCount(allVehicles.size());',
    '// Fleet KPIs (scoped to warehouse)\n        List<Driver> warehouseDrivers = driverRepository.findAll().stream()\n                .filter(d -> d.getWarehouse() != null && d.getWarehouse().getId().equals(warehouse.getId()))\n                .collect(Collectors.toList());\n        long availDrivers = warehouseDrivers.stream().filter(d -> d.getStatus() == DriverStatus.AVAILABLE).count();\n        dto.setDriversAvailableCount(availDrivers);\n        dto.setDriversTotalCount(warehouseDrivers.size());\n\n        List<Vehicle> warehouseVehicles = vehicleRepository.findAll().stream()\n                .filter(v -> v.getWarehouse() != null && v.getWarehouse().getId().equals(warehouse.getId()))\n                .collect(Collectors.toList());\n        long availVehicles = warehouseVehicles.stream().filter(v -> v.getStatus() == VehicleStatus.AVAILABLE).count();\n        dto.setVehiclesAvailableCount(availVehicles);\n        dto.setVehiclesTotalCount(warehouseVehicles.size());'
);

// Update getWarehouseDrivers to filter by warehouse
wmCode = wmCode.replace(
    'public List<Map<String, Object>> getWarehouseDrivers() {\n        Warehouse warehouse = getScopedWarehouse();\n        List<Driver> drivers = driverRepository.findAll();',
    'public List<Map<String, Object>> getWarehouseDrivers() {\n        Warehouse warehouse = getScopedWarehouse();\n        List<Driver> drivers = driverRepository.findAll().stream()\n                .filter(d -> d.getWarehouse() != null && d.getWarehouse().getId().equals(warehouse.getId()))\n                .collect(Collectors.toList());'
);

// Update getWarehouseVehicles to filter by warehouse
wmCode = wmCode.replace(
    'public List<Map<String, Object>> getWarehouseVehicles() {\n        Warehouse warehouse = getScopedWarehouse();\n        List<Vehicle> vehicles = vehicleRepository.findAll();',
    'public List<Map<String, Object>> getWarehouseVehicles() {\n        Warehouse warehouse = getScopedWarehouse();\n        List<Vehicle> vehicles = vehicleRepository.findAll().stream()\n                .filter(v -> v.getWarehouse() != null && v.getWarehouse().getId().equals(warehouse.getId()))\n                .collect(Collectors.toList());'
);

// Update getAvailableDrivers and getAvailableVehicles implementation
const oldAvailableMethods = `    @Transactional(readOnly = true)
    public List<Driver> getAvailableDrivers() {
        Warehouse warehouse = getScopedWarehouse();
        return driverRepository.findAll().stream()
                .filter(d -> d.getWarehouse() != null && d.getWarehouse().getId().equals(warehouse.getId()))
                .filter(d -> d.getStatus() == DriverStatus.AVAILABLE)
                .filter(d -> shipmentRepository.findActiveShipmentsByDriver(d).isEmpty())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Vehicle> getAvailableVehicles() {
        Warehouse warehouse = getScopedWarehouse();
        return vehicleRepository.findAll().stream()
                .filter(v -> v.getWarehouse() != null && v.getWarehouse().getId().equals(warehouse.getId()))
                .filter(v -> v.getStatus() == VehicleStatus.AVAILABLE)
                .filter(v -> shipmentRepository.findActiveShipmentsByVehicle(v).isEmpty())
                .collect(Collectors.toList());
    }`;

const newAvailableMethods = `    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAvailableDrivers() {
        Warehouse warehouse = getScopedWarehouse();
        return driverRepository.findAll().stream()
                .filter(d -> d.getWarehouse() != null && d.getWarehouse().getId().equals(warehouse.getId()))
                .filter(d -> d.getStatus() != DriverStatus.INACTIVE && d.getStatus() != DriverStatus.OFF_DUTY && d.getStatus() != DriverStatus.ON_TRIP)
                .filter(d -> shipmentRepository.findActiveShipmentsByDriver(d).isEmpty())
                .map(d -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", d.getId());
                    map.put("fullName", d.getFullName());
                    map.put("email", d.getEmail());
                    map.put("phone", d.getPhone());
                    map.put("licenseNumber", d.getLicenseNumber());
                    map.put("status", d.getStatus().name());
                    map.put("warehouseId", warehouse.getId());
                    map.put("warehouseCode", warehouse.getWarehouseCode());
                    return map;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAvailableVehicles() {
        Warehouse warehouse = getScopedWarehouse();
        return vehicleRepository.findAll().stream()
                .filter(v -> v.getWarehouse() != null && v.getWarehouse().getId().equals(warehouse.getId()))
                .filter(v -> v.getStatus() != VehicleStatus.INACTIVE && v.getStatus() != VehicleStatus.MAINTENANCE && v.getStatus() != VehicleStatus.IN_TRANSIT)
                .filter(v -> shipmentRepository.findActiveShipmentsByVehicle(v).isEmpty())
                .map(v -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", v.getId());
                    map.put("vehicleNumber", v.getVehicleNumber());
                    map.put("vehicleType", v.getVehicleType().name());
                    map.put("model", v.getModel());
                    map.put("manufacturer", v.getManufacturer());
                    map.put("capacity", v.getCapacity());
                    map.put("capacityUnit", v.getCapacityUnit());
                    map.put("status", v.getStatus().name());
                    map.put("warehouseId", warehouse.getId());
                    map.put("warehouseCode", warehouse.getWarehouseCode());
                    if (v.getAssignedDriver() != null) {
                        Map<String, Object> drvMap = new HashMap<>();
                        drvMap.put("id", v.getAssignedDriver().getId());
                        drvMap.put("fullName", v.getAssignedDriver().getFullName());
                        map.put("assignedDriver", drvMap);
                    } else {
                        map.put("assignedDriver", null);
                    }
                    return map;
                })
                .collect(Collectors.toList());
    }`;

if (wmCode.includes(oldAvailableMethods)) {
    wmCode = wmCode.replace(oldAvailableMethods, newAvailableMethods);
    console.log('Replaced available drivers & vehicles methods with mapped DTO lists.');
} else {
    console.log('Target available methods string not matched exactly, checking regex replacement...');
    wmCode = wmCode.replace(/@Transactional\(readOnly = true\)\s+public List<Driver> getAvailableDrivers\(\)[\s\S]*?public List<Vehicle> getAvailableVehicles\(\)[\s\S]*?collect\(Collectors\.toList\(\)\);\s*\}/m, newAvailableMethods);
}

fs.writeFileSync(basePath + '/service/WarehouseManagerService.java', wmCode, 'utf8');
console.log('WarehouseManagerService.java updated.');

// 5. WarehouseManagerController.java
console.log('Updating WarehouseManagerController.java...');
let ctrlCode = fs.readFileSync(basePath + '/controller/WarehouseManagerController.java', 'utf8');
ctrlCode = ctrlCode.replace(
    'public ResponseEntity<ApiResponse<List<Driver>>> getAvailableDrivers() {\n        List<Driver> drivers = warehouseManagerService.getAvailableDrivers();',
    'public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAvailableDrivers() {\n        List<Map<String, Object>> drivers = warehouseManagerService.getAvailableDrivers();'
);
ctrlCode = ctrlCode.replace(
    'public ResponseEntity<ApiResponse<List<Vehicle>>> getAvailableVehicles() {\n        List<Vehicle> vehicles = warehouseManagerService.getAvailableVehicles();',
    'public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAvailableVehicles() {\n        List<Map<String, Object>> vehicles = warehouseManagerService.getAvailableVehicles();'
);
fs.writeFileSync(basePath + '/controller/WarehouseManagerController.java', ctrlCode, 'utf8');
console.log('WarehouseManagerController.java updated.');

// 6. DataInitializer.java
console.log('Updating DataInitializer.java...');
let initCode = fs.readFileSync(basePath + '/config/DataInitializer.java', 'utf8');
initCode = initCode.replace(
    `if (s.getOriginWarehouse() == null) {
                        s.setOriginWarehouse((i % 2 == 0) ? blrWarehouse : mumWarehouse);
                        modified = true;
                    }
                    if (s.getDestinationWarehouse() == null) {
                        s.setDestinationWarehouse((i % 2 == 0) ? mumWarehouse : blrWarehouse);
                        modified = true;
                    }`,
    `if (s.getOriginWarehouse() == null) {
                        s.setOriginWarehouse((i % 2 == 0) ? blrWarehouse : mumWarehouse);
                        modified = true;
                    }
                    if (s.getDestinationWarehouse() == null || s.getDestinationWarehouse().getId().equals(s.getOriginWarehouse().getId())) {
                        s.setDestinationWarehouse(s.getOriginWarehouse().getId().equals(blrWarehouse.getId()) ? mumWarehouse : blrWarehouse);
                        modified = true;
                    }`
);
fs.writeFileSync(basePath + '/config/DataInitializer.java', initCode, 'utf8');
console.log('DataInitializer.java updated.');

console.log('All backend source updates applied successfully!');
