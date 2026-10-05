const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

// 1. DriverDeliveryDTO
const dddtoPath = path.join(BACKEND_BASE, 'dto\\driver\\DriverDeliveryDTO.java');
let dddto = fs.readFileSync(dddtoPath, 'utf8');

if (!dddto.includes('lastLocationUpdatedAt')) {
  dddto = dddto.replace(
    /private int estimatedDurationMins;\s*\r?\n/,
    `private int estimatedDurationMins;
    private Double currentLatitude;
    private Double currentLongitude;
    private String currentLocationName;
    private String lastLocationUpdatedAt;
`
  );

  const dddtoAccessors = `
    public Double getCurrentLatitude() { return currentLatitude; }
    public void setCurrentLatitude(Double currentLatitude) { this.currentLatitude = currentLatitude; }

    public Double getCurrentLongitude() { return currentLongitude; }
    public void setCurrentLongitude(Double currentLongitude) { this.currentLongitude = currentLongitude; }

    public String getCurrentLocationName() { return currentLocationName; }
    public void setCurrentLocationName(String currentLocationName) { this.currentLocationName = currentLocationName; }

    public String getLastLocationUpdatedAt() { return lastLocationUpdatedAt; }
    public void setLastLocationUpdatedAt(String lastLocationUpdatedAt) { this.lastLocationUpdatedAt = lastLocationUpdatedAt; }
}
`;
  dddto = dddto.replace(/\}\s*$/, dddtoAccessors);
  fs.writeFileSync(dddtoPath, dddto, 'utf8');
  console.log('✓ Updated DriverDeliveryDTO.java with location fields');
} else {
  console.log('DriverDeliveryDTO already contains location fields');
}

// 2. WarehouseShipmentDTO
const wsdtoPath = path.join(BACKEND_BASE, 'dto\\warehouse\\WarehouseShipmentDTO.java');
let wsdto = fs.readFileSync(wsdtoPath, 'utf8');

if (!wsdto.includes('lastLocationUpdatedAt')) {
  wsdto = wsdto.replace(
    /private String currentLocationName;\s*\r?\n/,
    `private String currentLocationName;
    private LocalDateTime lastLocationUpdatedAt;
`
  );

  const wsdtoAccessors = `
    public LocalDateTime getLastLocationUpdatedAt() { return lastLocationUpdatedAt; }
    public void setLastLocationUpdatedAt(LocalDateTime lastLocationUpdatedAt) { this.lastLocationUpdatedAt = lastLocationUpdatedAt; }
}
`;
  wsdto = wsdto.replace(/\}\s*$/, wsdtoAccessors);
  fs.writeFileSync(wsdtoPath, wsdto, 'utf8');
  console.log('✓ Updated WarehouseShipmentDTO.java with lastLocationUpdatedAt');
} else {
  console.log('WarehouseShipmentDTO already contains lastLocationUpdatedAt');
}
