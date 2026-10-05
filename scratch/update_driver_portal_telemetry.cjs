const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

// 1. Update DriverPortalService.java
const svcPath = path.join(BACKEND_BASE, 'service\\DriverPortalService.java');
let svcContent = fs.readFileSync(svcPath, 'utf8');

// Ensure import of DriverLocationUpdateRequest exists
if (!svcContent.includes('import com.primeroute.logistics.dto.driver.DriverLocationUpdateRequest;')) {
  svcContent = svcContent.replace(
    /import com.primeroute.logistics.dto.driver.\*;\s*\r?\n/,
    `import com.primeroute.logistics.dto.driver.*;
import com.primeroute.logistics.dto.driver.DriverLocationUpdateRequest;
import java.time.format.DateTimeFormatter;
`
  );
}

// Add updateDriverLocation method if not present
if (!svcContent.includes('public DriverDeliveryDTO updateDriverLocation(')) {
  const updateLocationMethod = `
    /**
     * Updates real-time GPS telemetry for the authenticated driver's active shipment.
     * DRIVER-ONLY operation.
     */
    @Transactional
    public DriverDeliveryDTO updateDriverLocation(Principal principal, DriverLocationUpdateRequest request) {
        Driver driver = resolveAuthenticatedDriver(principal);

        if (request == null) {
            throw new IllegalArgumentException("Location update request payload cannot be null");
        }

        if (request.getLatitude() == null || request.getLongitude() == null) {
            throw new IllegalArgumentException("Latitude and Longitude coordinates are required for GPS telemetry");
        }

        if (request.getLatitude() < -90.0 || request.getLatitude() > 90.0) {
            throw new IllegalArgumentException("Invalid latitude value: " + request.getLatitude() + ". Must be between -90.0 and 90.0");
        }

        if (request.getLongitude() < -180.0 || request.getLongitude() > 180.0) {
            throw new IllegalArgumentException("Invalid longitude value: " + request.getLongitude() + ". Must be between -180.0 and 180.0");
        }

        Shipment activeShipment = null;

        if (request.getShipmentId() != null) {
            Shipment target = shipmentRepository.findById(request.getShipmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + request.getShipmentId()));

            // Authorization check: Must be assigned to this driver
            if (target.getDriver() == null || !target.getDriver().getId().equals(driver.getId())) {
                throw new SecurityException("Access Denied: You do not have permission to transmit telemetry for shipment #" + request.getShipmentId());
            }

            // Status check: Must be actively in-flight
            if (target.getStatus() != OrderStatus.IN_TRANSIT && target.getStatus() != OrderStatus.OUT_FOR_DELIVERY) {
                throw new IllegalStateException("Cannot update GPS telemetry for shipment in state " + target.getStatus() + ". GPS updates are permitted only for active deliveries (IN_TRANSIT or OUT_FOR_DELIVERY).");
            }

            activeShipment = target;
        } else {
            // Locate active shipment for driver
            List<Shipment> activeList = shipmentRepository.findActiveShipmentsByDriver(driver);
            Optional<Shipment> inFlight = activeList.stream()
                    .filter(s -> s.getStatus() == OrderStatus.IN_TRANSIT || s.getStatus() == OrderStatus.OUT_FOR_DELIVERY)
                    .findFirst();

            if (inFlight.isEmpty()) {
                throw new IllegalStateException("No active delivery (IN_TRANSIT or OUT_FOR_DELIVERY) found for driver " + driver.getFullName() + ". Start a delivery trip before broadcasting live GPS coordinates.");
            }
            activeShipment = inFlight.get();
        }

        // Store live position on Shipment
        activeShipment.setCurrentLatitude(request.getLatitude());
        activeShipment.setCurrentLongitude(request.getLongitude());
        if (request.getLocationName() != null && !request.getLocationName().isBlank()) {
            activeShipment.setCurrentLocationName(request.getLocationName().trim());
        }
        LocalDateTime now = LocalDateTime.now();
        activeShipment.setLastLocationUpdatedAt(now);
        activeShipment.setUpdatedAt(now);

        Shipment saved = shipmentRepository.save(activeShipment);
        return toDriverDeliveryDTO(saved);
    }
`;

  // Insert before toDriverDeliveryDTO
  svcContent = svcContent.replace(
    /public DriverDeliveryDTO toDriverDeliveryDTO\(Shipment shipment\)/,
    updateLocationMethod + '\n    public DriverDeliveryDTO toDriverDeliveryDTO(Shipment shipment)'
  );
}

// Update toDriverDeliveryDTO to set telemetry fields
if (!svcContent.includes('dto.setCurrentLatitude(shipment.getCurrentLatitude())')) {
  svcContent = svcContent.replace(
    /dto\.setEstimatedDurationMins\(60\);/,
    `dto.setEstimatedDurationMins(60);
        dto.setCurrentLatitude(shipment.getCurrentLatitude());
        dto.setCurrentLongitude(shipment.getCurrentLongitude());
        dto.setCurrentLocationName(shipment.getCurrentLocationName());
        if (shipment.getLastLocationUpdatedAt() != null) {
            dto.setLastLocationUpdatedAt(shipment.getLastLocationUpdatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }`
  );
}

fs.writeFileSync(svcPath, svcContent, 'utf8');
console.log('✓ Successfully updated DriverPortalService.java');

// 2. Update DriverPortalController.java
const ctrlPath = path.join(BACKEND_BASE, 'controller\\DriverPortalController.java');
let ctrlContent = fs.readFileSync(ctrlPath, 'utf8');

if (!ctrlContent.includes('import com.primeroute.logistics.dto.driver.DriverLocationUpdateRequest;')) {
  ctrlContent = ctrlContent.replace(
    /import com.primeroute.logistics.dto.driver.\*;\s*\r?\n/,
    `import com.primeroute.logistics.dto.driver.*;
import com.primeroute.logistics.dto.driver.DriverLocationUpdateRequest;
`
  );
}

if (!ctrlContent.includes('/location')) {
  const locationEndpoints = `
    // ==========================================
    // REAL-TIME GPS TELEMETRY (DRIVER-ONLY)
    // ==========================================

    @PostMapping("/location")
    public ResponseEntity<ApiResponse<DriverDeliveryDTO>> updateDriverLocation(
            @RequestBody DriverLocationUpdateRequest request,
            Principal principal) {
        DriverDeliveryDTO dto = driverPortalService.updateDriverLocation(principal, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Live GPS telemetry recorded successfully", dto));
    }

    @PostMapping("/deliveries/{id}/location")
    public ResponseEntity<ApiResponse<DriverDeliveryDTO>> updateDeliveryLocation(
            @PathVariable Long id,
            @RequestBody(required = false) DriverLocationUpdateRequest request,
            Principal principal) {
        if (request == null) {
            request = new DriverLocationUpdateRequest();
        }
        request.setShipmentId(id);
        DriverDeliveryDTO dto = driverPortalService.updateDriverLocation(principal, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Live GPS telemetry recorded successfully", dto));
    }
}
`;
  ctrlContent = ctrlContent.replace(/\}\s*$/, locationEndpoints);
  fs.writeFileSync(ctrlPath, ctrlContent, 'utf8');
  console.log('✓ Successfully updated DriverPortalController.java with location endpoints');
} else {
  console.log('DriverPortalController.java already contains location endpoints');
}
