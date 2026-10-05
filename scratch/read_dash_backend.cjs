const fs = require('fs');

const backendDir = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management";

const dtoFile = backendDir + "\\src\\main\\java\\com\\primeroute\\logistics\\dto\\warehouse\\WarehouseDashboardDTO.java";
const svcFile = backendDir + "\\src\\main\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerService.java";
const repoFile = backendDir + "\\src\\main\\java\\com\\primeroute\\logistics\\repository\\ShipmentRepository.java";

console.log("=== WarehouseDashboardDTO.java ===");
console.log(fs.readFileSync(dtoFile, 'utf8'));

console.log("=== WarehouseManagerService.java (lines 170-260) ===");
const lines = fs.readFileSync(svcFile, 'utf8').split('\n');
console.log(lines.slice(170, 260).map((l, i) => `${i+171}: ${l}`).join('\n'));

console.log("=== ShipmentRepository.java ===");
console.log(fs.readFileSync(repoFile, 'utf8'));
