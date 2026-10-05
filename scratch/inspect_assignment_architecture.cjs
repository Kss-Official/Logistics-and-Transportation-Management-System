const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute';

function showFile(subpath) {
  const full = path.join(BACKEND_BASE, subpath);
  if (fs.existsSync(full)) {
    console.log(`\n=================== ${subpath} ===================`);
    console.log(fs.readFileSync(full, 'utf8'));
  } else {
    console.log(`NOT FOUND: ${full}`);
  }
}

// Check enums
showFile('model/OperationalStage.java');
showFile('model/AssignmentStatus.java');
showFile('model/Driver.java');
showFile('model/Vehicle.java');
showFile('repository/DriverRepository.java');
showFile('repository/VehicleRepository.java');
showFile('service/WarehouseManagerService.java');
showFile('controller/WarehouseManagerController.java');
showFile('service/AdminShipmentService.java');
