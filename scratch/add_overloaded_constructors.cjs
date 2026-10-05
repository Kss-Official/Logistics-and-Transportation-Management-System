const fs = require('fs');
const base = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

// AdminShipmentService: add fallback constructor if not present
let admin = fs.readFileSync(`${base}\\service\\AdminShipmentService.java`, 'utf8');
if (!admin.includes('public AdminShipmentService(\n            ShipmentRepository shipmentRepository,')) {
  const ctor = `    public AdminShipmentService(
            ShipmentRepository shipmentRepository,
            ShipmentTrackingEventRepository eventRepository,
            OrderRepository orderRepository,
            DriverRepository driverRepository,
            VehicleRepository vehicleRepository,
            NotificationService notificationService,
            GeocodingService geocodingService,
            WarehouseRepository warehouseRepository) {
        this(shipmentRepository, eventRepository, orderRepository, driverRepository, vehicleRepository, notificationService, geocodingService, warehouseRepository, null);
    }`;
  
  if (!admin.includes('this(shipmentRepository, eventRepository, orderRepository, driverRepository, vehicleRepository, notificationService, geocodingService, warehouseRepository, null);')) {
    admin = admin.replace(
      'this.proofOfDeliveryRepository = proofOfDeliveryRepository;\n    }',
      `this.proofOfDeliveryRepository = proofOfDeliveryRepository;\n    }\n\n${ctor}`
    );
    fs.writeFileSync(`${base}\\service\\AdminShipmentService.java`, admin, 'utf8');
    console.log('Added overloaded constructor to AdminShipmentService.java');
  }
}

// WarehouseManagerService: add fallback constructor if not present
let wm = fs.readFileSync(`${base}\\service\\WarehouseManagerService.java`, 'utf8');
if (!wm.includes('this(userRepository, warehouseRepository, inventoryRepository, transactionRepository, shipmentRepository, driverRepository, vehicleRepository, trackingEventRepository, orderRepository, shipmentService, null);')) {
  const wmCtor = `    public WarehouseManagerService(
            UserRepository userRepository,
            WarehouseRepository warehouseRepository,
            InventoryRepository inventoryRepository,
            InventoryTransactionRepository transactionRepository,
            ShipmentRepository shipmentRepository,
            DriverRepository driverRepository,
            VehicleRepository vehicleRepository,
            ShipmentTrackingEventRepository trackingEventRepository,
            OrderRepository orderRepository,
            ShipmentService shipmentService) {
        this(userRepository, warehouseRepository, inventoryRepository, transactionRepository, shipmentRepository, driverRepository, vehicleRepository, trackingEventRepository, orderRepository, shipmentService, null);
    }`;
  
  wm = wm.replace(
    'this.proofOfDeliveryRepository = proofOfDeliveryRepository;\n    }',
    `this.proofOfDeliveryRepository = proofOfDeliveryRepository;\n    }\n\n${wmCtor}`
  );
  fs.writeFileSync(`${base}\\service\\WarehouseManagerService.java`, wm, 'utf8');
  console.log('Added overloaded constructor to WarehouseManagerService.java');
}
