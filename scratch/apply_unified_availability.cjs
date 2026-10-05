const fs = require('fs');
const path = require('path');

const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

// 1. Update DriverRepository.java
const driverRepoPath = path.join(BACKEND_DIR, 'src/main/java/com/primeroute/logistics/repository/DriverRepository.java');
let driverRepo = fs.readFileSync(driverRepoPath, 'utf8').replace(/\r\n/g, '\n');

const oldDriverQuery = `@Query("SELECT d FROM Driver d WHERE d.status != com.primeroute.logistics.entity.DriverStatus.INACTIVE " +
           "AND NOT EXISTS (" +
           "  SELECT s FROM Shipment s WHERE s.driver = d " +
           "  AND s.status NOT IN (com.primeroute.logistics.entity.OrderStatus.DELIVERED, com.primeroute.logistics.entity.OrderStatus.CANCELLED)" +
           ") ORDER BY d.fullName ASC")
    List<Driver> findAvailableDrivers();`;

const newDriverQuery = `@Query("SELECT d FROM Driver d WHERE d.status NOT IN (com.primeroute.logistics.entity.DriverStatus.INACTIVE, com.primeroute.logistics.entity.DriverStatus.OFF_DUTY) " +
           "AND NOT EXISTS (" +
           "  SELECT s FROM Shipment s WHERE s.driver = d " +
           "  AND s.status NOT IN (com.primeroute.logistics.entity.OrderStatus.DELIVERED, com.primeroute.logistics.entity.OrderStatus.CANCELLED)" +
           ") ORDER BY d.fullName ASC")
    List<Driver> findAvailableDrivers();`;

if (driverRepo.includes(oldDriverQuery)) {
  driverRepo = driverRepo.replace(oldDriverQuery, newDriverQuery);
  fs.writeFileSync(driverRepoPath, driverRepo, 'utf8');
  console.log('Successfully updated DriverRepository.java');
} else {
  console.log('DriverRepository.java query already up to date or different');
}

// 2. Update AdminDriverService.java
const driverServicePath = path.join(BACKEND_DIR, 'src/main/java/com/primeroute/logistics/service/AdminDriverService.java');
let driverService = fs.readFileSync(driverServicePath, 'utf8').replace(/\r\n/g, '\n');

// Update getAllDrivers to be read-write @Transactional so synced status persists
driverService = driverService.replace(
  `    @Transactional(readOnly = true)\n    public List<AdminDriverDTO> getAllDrivers() {`,
  `    @Transactional\n    public List<AdminDriverDTO> getAllDrivers() {`
);

// Update convertToDto
const oldConvertToDto = `    private AdminDriverDTO convertToDto(Driver driver) {
        AdminDriverDTO dto = new AdminDriverDTO();
        dto.setId(driver.getId());
        dto.setFullName(driver.getFullName());
        dto.setEmail(driver.getEmail());
        dto.setPhone(driver.getPhone());
        dto.setLicenseNumber(driver.getLicenseNumber());
        dto.setLicenseExpiryDate(driver.getLicenseExpiryDate());
        dto.setAddress(driver.getAddress());
        dto.setStatus(driver.getStatus());
        dto.setCreatedAt(driver.getCreatedAt());
        dto.setUpdatedAt(driver.getUpdatedAt());

        if (driver.getShipments() != null) {
            dto.setAssignedShipmentsCount(driver.getShipments().size());
            List<String> trackingNos = driver.getShipments().stream()
                    .map(Shipment::getTrackingNumber)
                    .collect(Collectors.toList());
            dto.setAssignedShipmentNumbers(trackingNos);
        } else {
            dto.setAssignedShipmentsCount(0);
            dto.setAssignedShipmentNumbers(new ArrayList<>());
        }

        return dto;
    }`;

const newConvertToDto = `    private AdminDriverDTO convertToDto(Driver driver) {
        AdminDriverDTO dto = new AdminDriverDTO();
        dto.setId(driver.getId());
        dto.setFullName(driver.getFullName());
        dto.setEmail(driver.getEmail());
        dto.setPhone(driver.getPhone());
        dto.setLicenseNumber(driver.getLicenseNumber());
        dto.setLicenseExpiryDate(driver.getLicenseExpiryDate());
        dto.setAddress(driver.getAddress());
        dto.setCreatedAt(driver.getCreatedAt());
        dto.setUpdatedAt(driver.getUpdatedAt());

        // Genuinely active shipments count
        List<Shipment> activeShipments = shipmentRepository.findActiveShipmentsByDriver(driver);
        int activeCount = activeShipments.size();
        dto.setAssignedShipmentsCount(activeCount);

        List<String> activeTrackingNos = activeShipments.stream()
                .map(Shipment::getTrackingNumber)
                .collect(Collectors.toList());
        dto.setAssignedShipmentNumbers(activeTrackingNos);

        // Synchronize status with active shipment reality:
        // 1. INACTIVE remains INACTIVE (manually deactivated by admin)
        // 2. OFF_DUTY remains OFF_DUTY if no active shipments
        // 3. If driver is currently assigned to an active shipment, status is ON_TRIP
        // 4. Otherwise, if no active shipments, status is AVAILABLE
        DriverStatus computedStatus;
        if (driver.getStatus() == DriverStatus.INACTIVE) {
            computedStatus = DriverStatus.INACTIVE;
        } else if (driver.getStatus() == DriverStatus.OFF_DUTY && activeCount == 0) {
            computedStatus = DriverStatus.OFF_DUTY;
        } else if (activeCount > 0) {
            computedStatus = DriverStatus.ON_TRIP;
        } else {
            computedStatus = DriverStatus.AVAILABLE;
        }
        dto.setStatus(computedStatus);

        // Keep database entity in sync if status drifted
        if (driver.getStatus() != computedStatus && driver.getStatus() != DriverStatus.INACTIVE && driver.getStatus() != DriverStatus.OFF_DUTY) {
            driver.setStatus(computedStatus);
            driverRepository.save(driver);
        }

        return dto;
    }`;

if (driverService.includes(oldConvertToDto)) {
  driverService = driverService.replace(oldConvertToDto, newConvertToDto);
  console.log('Successfully updated convertToDto in AdminDriverService.java');
} else {
  console.warn('Could not find oldConvertToDto in AdminDriverService.java');
}

// In updateDriver, prevent setting AVAILABLE if driver has active shipments
const oldUpdateStatus = `        if (request.getStatus() != null) {
            driver.setStatus(request.getStatus());
        }`;

const newUpdateStatus = `        if (request.getStatus() != null) {
            List<Shipment> activeShipments = shipmentRepository.findActiveShipmentsByDriver(driver);
            if (!activeShipments.isEmpty() && request.getStatus() == DriverStatus.AVAILABLE) {
                throw new IllegalArgumentException("Cannot set driver status to AVAILABLE while assigned to active shipment (" + activeShipments.get(0).getTrackingNumber() + ").");
            }
            driver.setStatus(request.getStatus());
        }`;

if (driverService.includes(oldUpdateStatus)) {
  driverService = driverService.replace(oldUpdateStatus, newUpdateStatus);
  console.log('Successfully added active shipment guard to updateDriver');
} else {
  console.warn('Could not find oldUpdateStatus in AdminDriverService.java');
}

fs.writeFileSync(driverServicePath, driverService, 'utf8');
console.log('Finished updating AdminDriverService.java');
