const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';
const svcPath = path.join(BACKEND_BASE, 'service\\DriverPortalService.java');
let svc = fs.readFileSync(svcPath, 'utf8');

// 1. Add AccessDeniedException import
if (!svc.includes('import org.springframework.security.access.AccessDeniedException;')) {
  svc = svc.replace(
    'import org.springframework.security.core.Authentication;',
    'import org.springframework.security.access.AccessDeniedException;\nimport org.springframework.security.core.Authentication;'
  );
}

// 2. In updateDriverLocation: throw AccessDeniedException instead of SecurityException
svc = svc.replace(
  'throw new SecurityException("Access Denied: You do not have permission to transmit telemetry for shipment #" + request.getShipmentId());',
  'throw new AccessDeniedException("Access Denied: You do not have permission to transmit telemetry for shipment #" + request.getShipmentId());'
);

// 3. In toDriverDeliveryDTO: map currentLatitude, currentLongitude, currentLocationName, lastLocationUpdatedAt
if (!svc.includes('dto.setCurrentLatitude(shipment.getCurrentLatitude());')) {
  svc = svc.replace(
    'return dto;\r\n    }',
    `dto.setCurrentLatitude(shipment.getCurrentLatitude());
        dto.setCurrentLongitude(shipment.getCurrentLongitude());
        dto.setCurrentLocationName(shipment.getCurrentLocationName());
        if (shipment.getLastLocationUpdatedAt() != null) {
            dto.setLastLocationUpdatedAt(shipment.getLastLocationUpdatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }

        return dto;
    }`
  );
  if (!svc.includes('dto.setCurrentLatitude(shipment.getCurrentLatitude());')) {
    svc = svc.replace(
      'return dto;\n    }',
      `dto.setCurrentLatitude(shipment.getCurrentLatitude());
        dto.setCurrentLongitude(shipment.getCurrentLongitude());
        dto.setCurrentLocationName(shipment.getCurrentLocationName());
        if (shipment.getLastLocationUpdatedAt() != null) {
            dto.setLastLocationUpdatedAt(shipment.getLastLocationUpdatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }

        return dto;
    }`
    );
  }
}

fs.writeFileSync(svcPath, svc, 'utf8');
console.log('✓ Successfully updated DriverPortalService.java with telemetry mapping & AccessDeniedException');
