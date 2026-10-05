const fs = require('fs');
const filePath = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/service/WarehouseManagerService.java';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update authorization in assignFleet
const regexAuth = /if\s*\(user\s*==\s*null\s*\|\|\s*\(user\.getRole\(\)\s*!=\s*Role\.WAREHOUSE_MANAGER\s*&&\s*user\.getRole\(\)\s*!=\s*Role\.ADMIN\)\)\s*\{[\s\S]*?throw\s*new\s*AccessDeniedException\([^)]+\);[\s\S]*?\}\s*Warehouse\s*warehouse\s*=\s*getScopedWarehouse\(\);[\s\S]*?String\s*performer\s*=\s*user\.getRole\(\)\s*==\s*Role\.ADMIN[\s\S]*?:[^\n]+\n/m;

const replacementAuth = `if (user == null || user.getRole() != Role.WAREHOUSE_MANAGER) {
            throw new AccessDeniedException("Only Warehouse Managers can perform standard operational fleet assignments. Administrators must use the Admin Override Assignment API.");
        }
        Warehouse warehouse = getScopedWarehouse();
        String performer = "Warehouse Manager (" + user.getFullName() + ")";\n`;

if (regexAuth.test(content)) {
    content = content.replace(regexAuth, replacementAuth);
    console.log('Successfully replaced assignFleet authorization check.');
} else {
    console.log('Regex auth did not match. Checking manually...');
}

// 2. Update driver status in assignFleet (from ON_TRIP to ON_DUTY)
const regexDriverStatus = /\/\/ Update Driver & Vehicle Status[\r\n\s]+driver\.setStatus\(DriverStatus\.ON_TRIP\);/m;
if (regexDriverStatus.test(content)) {
    content = content.replace(regexDriverStatus, '// Update Driver & Vehicle Status\n        driver.setStatus(DriverStatus.ON_DUTY);');
    console.log('Successfully updated driver.setStatus to DriverStatus.ON_DUTY in assignFleet.');
} else {
    console.log('Driver status update regex did not match.');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('WarehouseManagerService.java write finished.');
