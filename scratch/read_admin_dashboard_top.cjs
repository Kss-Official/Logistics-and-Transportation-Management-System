const fs = require('fs');
const f2 = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\AdminDashboardService.java';
const lines = fs.readFileSync(f2, 'utf8').split('\n');
console.log(lines.slice(0, 70).join('\n'));
