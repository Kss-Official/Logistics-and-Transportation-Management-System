const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';
const svcPath = path.join(BACKEND_BASE, 'service\\DriverPortalService.java');
let svc = fs.readFileSync(svcPath, 'utf8');

// 1. Remove shipment telemetry from getDriverProfile
const badProfileBlock = `        dto.setCurrentLatitude(shipment.getCurrentLatitude());
        dto.setCurrentLongitude(shipment.getCurrentLongitude());
        dto.setCurrentLocationName(shipment.getCurrentLocationName());
        if (shipment.getLastLocationUpdatedAt() != null) {
            dto.setLastLocationUpdatedAt(shipment.getLastLocationUpdatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }

        return dto;`;

svc = svc.replace(badProfileBlock, '        return dto;');

// 2. Put telemetry fields in toDriverDeliveryDTO right before return dto;
const toDtoEnd = `            dto.setProofOfDelivery(podDto);
        }

        return dto;
    }`;

const goodDtoEnd = `            dto.setProofOfDelivery(podDto);
        }

        // Live Telemetry GPS fields
        dto.setCurrentLatitude(shipment.getCurrentLatitude());
        dto.setCurrentLongitude(shipment.getCurrentLongitude());
        dto.setCurrentLocationName(shipment.getCurrentLocationName());
        if (shipment.getLastLocationUpdatedAt() != null) {
            dto.setLastLocationUpdatedAt(shipment.getLastLocationUpdatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }

        return dto;
    }`;

svc = svc.replace(toDtoEnd, goodDtoEnd);

fs.writeFileSync(svcPath, svc, 'utf8');
console.log('✓ Corrected DriverPortalService.java mapping');
