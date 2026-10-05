const fs = require('fs');
const path = require('path');
const backendDir = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management";

const files = [
    'src/test/java/com/primeroute/logistics/service/WarehouseManagerFleetAssignmentTest.java',
    'src/test/java/com/primeroute/logistics/service/WarehouseManagerPickPackTest.java',
    'src/test/java/com/primeroute/logistics/service/WarehouseManagerShipmentScopingTest.java'
];

files.forEach(f => {
    const full = path.join(backendDir, f);
    const content = fs.readFileSync(full, 'utf8');
    const lines = content.split('\n');
    console.log(`=== ${f} ===`);
    lines.forEach((l, idx) => {
        if (l.includes('getDashboard') || l.includes('findReadyForDispatch') || l.includes('findByOriginWarehouse')) {
            console.log(`L${idx+1}: ${l.trim()}`);
        }
    });
});
