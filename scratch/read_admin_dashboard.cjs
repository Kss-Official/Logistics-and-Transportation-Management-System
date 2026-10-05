const fs = require('fs');

const f1 = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\dto\\AdminDashboardSummaryDTO.java';
const f2 = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\AdminDashboardService.java';

console.log('--- AdminDashboardSummaryDTO ---');
console.log(fs.readFileSync(f1, 'utf8'));

console.log('--- AdminDashboardService ---');
console.log(fs.readFileSync(f2, 'utf8'));
