const fs = require('fs');

const content = fs.readFileSync('C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/service/WarehouseManagerService.java', 'utf8');
const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes('WarehouseDashboardDTO getDashboard'));
console.log(lines.slice(idx, idx + 40).join('\n'));
