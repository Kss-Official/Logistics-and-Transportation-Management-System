const fs = require('fs');
const file = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/service/WarehouseManagerService.java';
let content = fs.readFileSync(file, 'utf8');

// Normalize CRLF to LF for matching
const isCrlf = content.includes('\r\n');
let norm = content.replace(/\r\n/g, '\n');

const target = `public WarehouseShipmentDTO assignFleet(Long id, AssignFleetRequest request) {
        Warehouse warehouse = getScopedWarehouse();
        User user = getAuthenticatedUser();
        String performer = user != null && user.getFullName() != null ? user.getFullName() : "Warehouse Manager";`;

const replacement = `public WarehouseShipmentDTO assignFleet(Long id, AssignFleetRequest request) {
        User user = getAuthenticatedUser();
        if (user == null || user.getRole() != Role.WAREHOUSE_MANAGER) {
            throw new AccessDeniedException("Only Warehouse Managers can perform standard operational fleet assignments. Administrators must use the Admin Override Assignment API.");
        }
        Warehouse warehouse = getScopedWarehouse();
        String performer = "Warehouse Manager (" + user.getFullName() + ")";`;

if (norm.includes(target)) {
  norm = norm.replace(target, replacement);
  fs.writeFileSync(file, isCrlf ? norm.replace(/\n/g, '\r\n') : norm, 'utf8');
  console.log("SUCCESS: assignFleet updated with strict WAREHOUSE_MANAGER role check.");
} else {
  console.error("Target pattern not found in WarehouseManagerService.java");
}
