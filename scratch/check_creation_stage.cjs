const fs = require('fs');
const path = require('path');
const backendDir = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management";

function grepFiles(str) {
    const files = [
        'src/main/java/com/primeroute/logistics/service/OrderService.java',
        'src/main/java/com/primeroute/logistics/service/ShipmentService.java',
        'src/main/java/com/primeroute/logistics/service/FulfillmentEngineService.java',
        'src/main/java/com/primeroute/logistics/service/WarehouseManagerService.java'
    ];
    for (const f of files) {
        const full = path.join(backendDir, f);
        if (fs.existsSync(full)) {
            const lines = fs.readFileSync(full, 'utf8').split('\n');
            lines.forEach((l, idx) => {
                if (l.includes(str)) console.log(`${f}:L${idx+1}: ${l.trim()}`);
            });
        }
    }
}

console.log("=== Checking createShipment / operationalStage ===");
grepFiles('operationalStage');
grepFiles('setOperationalStage');
