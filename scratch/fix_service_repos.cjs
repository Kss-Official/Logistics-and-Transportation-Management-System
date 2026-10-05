const fs = require('fs');
const base = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

// 1. AdminShipmentService.java
let admin = fs.readFileSync(`${base}\\service\\AdminShipmentService.java`, 'utf8');
if (!admin.includes('private final ProofOfDeliveryRepository proofOfDeliveryRepository;')) {
  admin = admin.replace(
    'private final WarehouseRepository warehouseRepository;',
    'private final WarehouseRepository warehouseRepository;\n    private final ProofOfDeliveryRepository proofOfDeliveryRepository;'
  );
  
  admin = admin.replace(
    'WarehouseRepository warehouseRepository) {',
    'WarehouseRepository warehouseRepository,\n            @org.springframework.beans.factory.annotation.Autowired(required = false) ProofOfDeliveryRepository proofOfDeliveryRepository) {'
  );
  
  admin = admin.replace(
    'this.warehouseRepository = warehouseRepository;',
    'this.warehouseRepository = warehouseRepository;\n        this.proofOfDeliveryRepository = proofOfDeliveryRepository;'
  );
  fs.writeFileSync(`${base}\\service\\AdminShipmentService.java`, admin, 'utf8');
  console.log('Fixed AdminShipmentService.java');
}

// 2. WarehouseManagerService.java
let wm = fs.readFileSync(`${base}\\service\\WarehouseManagerService.java`, 'utf8');
if (!wm.includes('private final ProofOfDeliveryRepository proofOfDeliveryRepository;')) {
  wm = wm.replace(
    'private final ShipmentService shipmentService;',
    'private final ShipmentService shipmentService;\n    private final ProofOfDeliveryRepository proofOfDeliveryRepository;'
  );
  
  wm = wm.replace(
    'ShipmentService shipmentService) {',
    'ShipmentService shipmentService,\n            @org.springframework.beans.factory.annotation.Autowired(required = false) ProofOfDeliveryRepository proofOfDeliveryRepository) {'
  );
  
  wm = wm.replace(
    'this.shipmentService = shipmentService;',
    'this.shipmentService = shipmentService;\n        this.proofOfDeliveryRepository = proofOfDeliveryRepository;'
  );
  fs.writeFileSync(`${base}\\service\\WarehouseManagerService.java`, wm, 'utf8');
  console.log('Fixed WarehouseManagerService.java');
}
