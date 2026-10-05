const fs = require('fs');

const backendDir = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management";
const svcFile = backendDir + "\\src\\main\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerService.java";

const content = fs.readFileSync(svcFile, 'utf8');
const lines = content.split('\n');

lines.forEach((l, idx) => {
    if (l.includes('getOutgoingShipments') || l.includes('getIncomingShipments')) {
        console.log(`Line ${idx+1}: ${l}`);
        console.log(lines.slice(idx, idx + 35).join('\n'));
    }
});
