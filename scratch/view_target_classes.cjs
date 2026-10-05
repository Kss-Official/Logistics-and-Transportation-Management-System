const fs = require('fs');
const path = require('path');
const ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

function show(rel) {
  const p = path.join(ROOT, rel);
  console.log(`\n=================== ${rel} ===================`);
  console.log(fs.readFileSync(p, 'utf8'));
}

show('dto/warehouse/AssignFleetRequest.java');
show('controller/WarehouseManagerController.java');
show('service/WarehouseManagerService.java');
show('entity/Driver.java');
show('entity/Vehicle.java');
show('entity/DriverStatus.java');
show('entity/VehicleStatus.java');
show('repository/DriverRepository.java');
show('repository/VehicleRepository.java');
show('repository/ShipmentRepository.java');
