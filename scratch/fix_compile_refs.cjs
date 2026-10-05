const fs = require('fs');
const path = require('path');

const BASE_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

// 1. WarehouseRepository.java
const whRepoPath = path.join(BASE_DIR, 'repository/WarehouseRepository.java');
let whRepo = fs.readFileSync(whRepoPath, 'utf8');
if (!whRepo.includes('findByWarehouseCode(')) {
  whRepo = whRepo.replace(
    'Optional<Warehouse> findByWarehouseCodeIgnoreCase(String warehouseCode);',
    `Optional<Warehouse> findByWarehouseCodeIgnoreCase(String warehouseCode);

    Optional<Warehouse> findByWarehouseCode(String warehouseCode);`
  );
  fs.writeFileSync(whRepoPath, whRepo, 'utf8');
  console.log('Updated: repository/WarehouseRepository.java');
}

// 2. ShipmentTrackingEvent.java
const stePath = path.join(BASE_DIR, 'entity/ShipmentTrackingEvent.java');
let ste = fs.readFileSync(stePath, 'utf8');
if (!ste.includes('public ShipmentTrackingEvent(Shipment shipment, OrderStatus status,')) {
  ste = ste.replace(
    'public ShipmentTrackingEvent(Shipment shipment, String status, String title, String description, String locationName, Double latitude, Double longitude, LocalDateTime eventTime) {',
    `public ShipmentTrackingEvent(Shipment shipment, OrderStatus status, String title, String locationName, String description) {
        this.shipment = shipment;
        this.status = status != null ? status.name() : "IN_TRANSIT";
        this.title = title;
        this.description = description;
        this.locationName = locationName != null ? locationName : "Warehouse Hub";
        this.eventTime = LocalDateTime.now();
    }

    public ShipmentTrackingEvent(Shipment shipment, String status, String title, String description, String locationName, Double latitude, Double longitude, LocalDateTime eventTime) {`
  );
  fs.writeFileSync(stePath, ste, 'utf8');
  console.log('Updated: entity/ShipmentTrackingEvent.java');
}

console.log('Fixed compile references.');
