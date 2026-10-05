const fs = require('fs');
const path = require('path');
const basePath = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";
const wmServicePath = path.join(basePath, "service/WarehouseManagerService.java");

let content = fs.readFileSync(wmServicePath, 'utf8');

const oldConstructor = `    public WarehouseManagerService(
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
        this.userRepository = userRepository;
        this.warehouseRepository = warehouseRepository;
        this.inventoryRepository = inventoryRepository;
        this.transactionRepository = transactionRepository;
        this.shipmentRepository = shipmentRepository;
        this.driverRepository = driverRepository;
        this.vehicleRepository = vehicleRepository;
        this.trackingEventRepository = trackingEventRepository;
    }`;

const newConstructors = `    @org.springframework.beans.factory.annotation.Autowired
    public WarehouseManagerService(
            UserRepository userRepository,
            WarehouseRepository warehouseRepository,
            InventoryRepository inventoryRepository,
            InventoryTransactionRepository transactionRepository,
            ShipmentRepository shipmentRepository,
            DriverRepository driverRepository,
            VehicleRepository vehicleRepository,
            ShipmentTrackingEventRepository trackingEventRepository,
            @org.springframework.context.annotation.Lazy OrderRepository orderRepository,
            @org.springframework.context.annotation.Lazy ShipmentService shipmentService) {
        this.userRepository = userRepository;
        this.warehouseRepository = warehouseRepository;
        this.inventoryRepository = inventoryRepository;
        this.transactionRepository = transactionRepository;
        this.shipmentRepository = shipmentRepository;
        this.driverRepository = driverRepository;
        this.vehicleRepository = vehicleRepository;
        this.trackingEventRepository = trackingEventRepository;
        this.orderRepository = orderRepository;
        this.shipmentService = shipmentService;
    }

    public WarehouseManagerService(
            UserRepository userRepository,
            WarehouseRepository warehouseRepository,
            InventoryRepository inventoryRepository,
            InventoryTransactionRepository transactionRepository,
            ShipmentRepository shipmentRepository,
            DriverRepository driverRepository,
            VehicleRepository vehicleRepository,
            ShipmentTrackingEventRepository trackingEventRepository) {
        this(userRepository, warehouseRepository, inventoryRepository, transactionRepository, shipmentRepository, driverRepository, vehicleRepository, trackingEventRepository, null, null);
    }`;

content = content.replace(oldConstructor, newConstructors);
fs.writeFileSync(wmServicePath, content, 'utf8');
console.log("Updated WarehouseManagerService constructors");
