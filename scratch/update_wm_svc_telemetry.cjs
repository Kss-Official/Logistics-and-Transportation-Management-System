const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';
const wmSvcPath = path.join(BACKEND_BASE, 'service\\WarehouseManagerService.java');
let wmSvcContent = fs.readFileSync(wmSvcPath, 'utf8');

// 1. In mapToShipmentDTO: set lastLocationUpdatedAt
if (!wmSvcContent.includes('dto.setLastLocationUpdatedAt(s.getLastLocationUpdatedAt());')) {
  wmSvcContent = wmSvcContent.replace(
    /dto\.setCurrentLocationName\(s\.getCurrentLocationName\(\)\);/,
    `dto.setCurrentLocationName(s.getCurrentLocationName());\r\n        dto.setLastLocationUpdatedAt(s.getLastLocationUpdatedAt());`
  );
}

// 2. In getLiveTrackingData: include lastLocationUpdatedAt and active in-flight shipments
if (!wmSvcContent.includes('m.put("lastLocationUpdatedAt", s.getLastLocationUpdatedAt());')) {
  wmSvcContent = wmSvcContent.replace(
    /m\.put\("updatedAt", s\.getUpdatedAt\(\)\);/,
    `m.put("updatedAt", s.getUpdatedAt());\r\n            m.put("lastLocationUpdatedAt", s.getLastLocationUpdatedAt());`
  );
}

fs.writeFileSync(wmSvcPath, wmSvcContent, 'utf8');
console.log('✓ Successfully updated WarehouseManagerService.java');
