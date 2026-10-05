const fs = require('fs');
const path = require('path');

const backendRoot = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

// 1. Update ShipmentRepository.java
const shipRepoPath = path.join(backendRoot, 'repository', 'ShipmentRepository.java');
let shipRepoContent = fs.readFileSync(shipRepoPath, 'utf8');
if (!shipRepoContent.includes('List<Shipment> findByDriver(Driver driver);')) {
  shipRepoContent = shipRepoContent.replace(
    'Optional<Shipment> findByOrder_OrderNumberAndOrder_Customer(String orderNumber, User customer);',
    'Optional<Shipment> findByOrder_OrderNumberAndOrder_Customer(String orderNumber, User customer);\n\n    List<Shipment> findByDriver(Driver driver);\n\n    List<Shipment> findByDriverAndStatus(Driver driver, com.primeroute.logistics.entity.OrderStatus status);'
  );
  fs.writeFileSync(shipRepoPath, shipRepoContent, 'utf8');
  console.log('Updated ShipmentRepository.java');
}

// 2. Update DriverPortalService.java
const dpsPath = path.join(backendRoot, 'service', 'DriverPortalService.java');
let dpsContent = fs.readFileSync(dpsPath, 'utf8');
dpsContent = dpsContent.replace(/v\.getDriver\(\)/g, 'v.getAssignedDriver()');
fs.writeFileSync(dpsPath, dpsContent, 'utf8');
console.log('Updated DriverPortalService.java');
