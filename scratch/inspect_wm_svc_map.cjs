const fs = require('fs');

const backendDir = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management";
const svcFile = backendDir + "\\src\\main\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerService.java";

const content = fs.readFileSync(svcFile, 'utf8');
const lines = content.split('\n');

function printRange(start, end) {
    console.log(lines.slice(start - 1, end).map((l, i) => `${start + i}: ${l}`).join('\n'));
}

console.log("=== getOutgoingShipments ===");
lines.forEach((l, idx) => {
    if (l.includes('getOutgoingShipments(') || l.includes('mapToShipmentDTO(')) {
        console.log(`Found around line ${idx+1}`);
        printRange(Math.max(1, idx - 2), Math.min(lines.length, idx + 40));
    }
});
