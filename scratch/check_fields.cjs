const fs = require('fs');
const file = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/entity/Warehouse.java';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n').filter(l => l.includes('private ') && !l.includes('static'));
console.log(lines.join('\n'));
