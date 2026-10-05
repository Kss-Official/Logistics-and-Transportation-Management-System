const fs = require('fs');
const path = require('path');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

// 1. Update DriverRepository.java
const driverRepoPath = path.join(BACKEND_BASE, 'repository', 'DriverRepository.java');
let driverRepo = fs.readFileSync(driverRepoPath, 'utf8');
if (!driverRepo.includes('countByWarehouseAndStatus')) {
  driverRepo = driverRepo.replace(
    'Optional<Driver> findByIdWithShipments(Long id);',
    `Optional<Driver> findByIdWithShipments(Long id);\n\n    long countByStatus(DriverStatus status);\n\n    long countByWarehouseAndStatus(com.primeroute.logistics.entity.Warehouse warehouse, DriverStatus status);`
  );
  fs.writeFileSync(driverRepoPath, driverRepo, 'utf8');
  console.log('Updated DriverRepository.java');
}

// 2. Update VehicleRepository.java
const vehicleRepoPath = path.join(BACKEND_BASE, 'repository', 'VehicleRepository.java');
let vehicleRepo = fs.readFileSync(vehicleRepoPath, 'utf8');
if (!vehicleRepo.includes('countByWarehouseAndStatus')) {
  vehicleRepo = vehicleRepo.replace(
    'long countByStatus(VehicleStatus status);',
    `long countByStatus(VehicleStatus status);\n\n    long countByWarehouseAndStatus(com.primeroute.logistics.entity.Warehouse warehouse, VehicleStatus status);`
  );
  fs.writeFileSync(vehicleRepoPath, vehicleRepo, 'utf8');
  console.log('Updated VehicleRepository.java');
}
