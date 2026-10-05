const fs = require('fs');
const path = require('path');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

// 1. WarehouseRepository.java
const whRepoPath = path.join(BACKEND_BASE, 'repository', 'WarehouseRepository.java');
let whRepo = fs.readFileSync(whRepoPath, 'utf8');
if (!whRepo.includes('countByStatus')) {
  whRepo = whRepo.replace(
    'List<Warehouse> findByStatus(WarehouseStatus status);',
    'List<Warehouse> findByStatus(WarehouseStatus status);\n\n    long countByStatus(WarehouseStatus status);'
  );
  fs.writeFileSync(whRepoPath, whRepo, 'utf8');
  console.log('Updated WarehouseRepository.java');
}

// 2. AdminWarehouseService.java constructor fix
const whSvcPath = path.join(BACKEND_BASE, 'service', 'AdminWarehouseService.java');
let whSvc = fs.readFileSync(whSvcPath, 'utf8');
// Let's inspect the fields and constructor
whSvc = whSvc.replace(
  /public AdminWarehouseService\([\s\S]*?\{[\s\S]*?this\.routeRepository = routeRepository;[\s\S]*?\}/,
  `public AdminWarehouseService(
            WarehouseRepository warehouseRepository,
            ShipmentRepository shipmentRepository,
            RouteRepository routeRepository,
            DriverRepository driverRepository,
            VehicleRepository vehicleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.warehouseRepository = warehouseRepository;
        this.shipmentRepository = shipmentRepository;
        this.routeRepository = routeRepository;
        this.driverRepository = driverRepository;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }`
);
fs.writeFileSync(whSvcPath, whSvc, 'utf8');
console.log('Fixed AdminWarehouseService.java constructor');

// 3. AdminDashboardService.java fixes
const dashSvcPath = path.join(BACKEND_BASE, 'service', 'AdminDashboardService.java');
let dashSvc = fs.readFileSync(dashSvcPath, 'utf8');

dashSvc = dashSvc.replace(
  'Double revenueVal = orderRepository.sumTotalRevenueExcludingCancelled();',
  'Double revenueVal = orderRepository.sumTotalRevenue();'
);

dashSvc = dashSvc.replace(
  `        long unassignedOrders = allOrders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED && o.getStatus() != OrderStatus.DELIVERED)
                .filter(o -> o.getShipment() == null)
                .count();`,
  `        Set<Long> assignedOrderIds = allShipments.stream()
                .filter(s -> s.getOrder() != null)
                .map(s -> s.getOrder().getId())
                .collect(Collectors.toSet());

        long unassignedOrders = allOrders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED && o.getStatus() != OrderStatus.DELIVERED)
                .filter(o -> !assignedOrderIds.contains(o.getId()))
                .count();`
);

dashSvc = dashSvc.replace(
  `        long delayedCount = allShipments.stream()
                .filter(s -> s.getStatus() == OrderStatus.DELAYED || s.getStatus() == OrderStatus.EXCEPTION)
                .count();`,
  `        long delayedCount = allShipments.stream()
                .filter(s -> "DELAYED".equalsIgnoreCase(s.getOperationalStage()) || 
                             "EXCEPTION".equalsIgnoreCase(s.getOperationalStage()) ||
                             (s.getStatus() != null && s.getStatus().name().contains("DELAY")))
                .count();`
);

fs.writeFileSync(dashSvcPath, dashSvc, 'utf8');
console.log('Fixed AdminDashboardService.java');
