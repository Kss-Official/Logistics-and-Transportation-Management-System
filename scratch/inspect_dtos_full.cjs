const fs = require('fs');
const BASE = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/dto';

console.log('--- ShipmentSummaryDTO.java ---');
console.log(fs.readFileSync(BASE + '/ShipmentSummaryDTO.java', 'utf8'));

console.log('--- TrackingResponseDTO.java (last 100 lines) ---');
const trkLines = fs.readFileSync(BASE + '/TrackingResponseDTO.java', 'utf8').split('\n');
console.log(trkLines.slice(trkLines.length - 100).join('\n'));
