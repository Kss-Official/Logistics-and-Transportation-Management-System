const fs = require('fs');
const path = require('path');
const basePath = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";
const wmServicePath = path.join(basePath, "service/WarehouseManagerService.java");

const lines = fs.readFileSync(wmServicePath, 'utf8').split('\n');

const newConstructorLines = [
  "    public WarehouseManagerService(",
  "            UserRepository userRepository,",
  "            WarehouseRepository warehouseRepository,",
  "            InventoryRepository inventoryRepository,",
  "            InventoryTransactionRepository transactionRepository,",
  "            ShipmentRepository shipmentRepository,",
  "            DriverRepository driverRepository,",
  "            VehicleRepository vehicleRepository,",
  "            ShipmentTrackingEventRepository trackingEventRepository,",
  "            OrderRepository orderRepository,",
  "            ShipmentService shipmentService) {",
  "        this.userRepository = userRepository;",
  "        this.warehouseRepository = warehouseRepository;",
  "        this.inventoryRepository = inventoryRepository;",
  "        this.transactionRepository = transactionRepository;",
  "        this.shipmentRepository = shipmentRepository;",
  "        this.driverRepository = driverRepository;",
  "        this.vehicleRepository = vehicleRepository;",
  "        this.trackingEventRepository = trackingEventRepository;",
  "        this.orderRepository = orderRepository;",
  "        this.shipmentService = shipmentService;",
  "    }",
  "",
  "    public WarehouseManagerService(",
  "            UserRepository userRepository,",
  "            WarehouseRepository warehouseRepository,",
  "            InventoryRepository inventoryRepository,",
  "            InventoryTransactionRepository transactionRepository,",
  "            ShipmentRepository shipmentRepository,",
  "            DriverRepository driverRepository,",
  "            VehicleRepository vehicleRepository,",
  "            ShipmentTrackingEventRepository trackingEventRepository) {",
  "        this(userRepository, warehouseRepository, inventoryRepository, transactionRepository, shipmentRepository, driverRepository, vehicleRepository, trackingEventRepository, null, null);",
  "    }"
];

// Lines 34 to 53 is the constructor (index 33 to 53)
lines.splice(33, 20, ...newConstructorLines);

fs.writeFileSync(wmServicePath, lines.join('\n'), 'utf8');
console.log("Successfully replaced constructors via array splice!");
