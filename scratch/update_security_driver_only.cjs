const fs = require('fs');
const path = require('path');

const backendRoot = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

// 1. Update DriverPortalController.java
const controllerPath = path.join(backendRoot, 'controller', 'DriverPortalController.java');
let controllerContent = fs.readFileSync(controllerPath, 'utf8');

controllerContent = controllerContent.replace(
  "@PreAuthorize(\"hasRole('DRIVER') or hasRole('ADMIN')\")",
  "@PreAuthorize(\"hasRole('DRIVER')\")"
);

fs.writeFileSync(controllerPath, controllerContent, 'utf8');
console.log('Updated DriverPortalController.java -> @PreAuthorize("hasRole(\'DRIVER\')")');

// 2. Update DriverPortalService.java - remove admin fallback
const servicePath = path.join(backendRoot, 'service', 'DriverPortalService.java');
let serviceContent = fs.readFileSync(servicePath, 'utf8');

const fallbackBlock = `        // 3. Fallback for testing/admin context: first available driver
        List<Driver> all = driverRepository.findAll();
        if (!all.isEmpty()) {
            return all.get(0);
        }`;

if (serviceContent.includes(fallbackBlock)) {
  serviceContent = serviceContent.replace(fallbackBlock, '');
  fs.writeFileSync(servicePath, serviceContent, 'utf8');
  console.log('Removed admin fallback from DriverPortalService.java');
} else {
  console.log('Fallback block not found or already removed');
}
