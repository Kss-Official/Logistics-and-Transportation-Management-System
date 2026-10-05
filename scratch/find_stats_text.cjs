const fs = require('fs');
const f = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\OrderService.java';
const content = fs.readFileSync(f, 'utf8');
const idx = content.indexOf('getDashboardStats');
console.log(content.substring(idx - 50, idx + 800));
