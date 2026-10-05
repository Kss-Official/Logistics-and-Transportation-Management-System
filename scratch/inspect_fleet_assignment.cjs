const fs = require('fs');
const path = require('path');

const ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

function show(rel) {
  const p = path.join(ROOT, rel);
  if (fs.existsSync(p)) {
    console.log(`\n=================== ${rel} ===================`);
    console.log(fs.readFileSync(p, 'utf8'));
  } else {
    console.log(`NOT FOUND: ${p}`);
  }
}

show('dto/warehouse/AssignFleetRequest.java');
show('entity/Shipment.java');
show('entity/Driver.java');
show('entity/Vehicle.java');
show('repository/DriverRepository.java');
show('repository/VehicleRepository.java');
show('service/WarehouseManagerService.java');
show('controller/WarehouseManagerController.java');
show('service/AdminShipmentService.java');
