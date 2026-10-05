const fs = require('fs');
const filePath = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/service/WarehouseManagerService.java';
const lines = fs.readFileSync(filePath, 'utf8').split('\n');
const mapIdx = lines.findIndex(l => l.includes('private WarehouseShipmentDTO mapToShipmentDTO'));
console.log(lines.slice(mapIdx, mapIdx + 90).map((l, i) => `${i + mapIdx + 1}: ${l}`).join('\n'));
