const fs = require('fs');

const backendDir = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management";
const wmServicePath = backendDir + "\\src\\main\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerService.java";
let content = fs.readFileSync(wmServicePath, 'utf8');

const isCRLF = content.includes('\r\n');
let normalized = content.replace(/\r\n/g, '\n');

normalized = normalized.replace('for (Shipment s : outgoing)', 'for (Shipment s : nonCancelledOutgoing)');

const finalContent = isCRLF ? normalized.replace(/\n/g, '\r\n') : normalized;
fs.writeFileSync(wmServicePath, finalContent, 'utf8');
console.log("Fixed 'outgoing' variable in WarehouseManagerService.java.");
