const fs = require('fs');
const base = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

console.log('=== TrackingResponseDTO.java ===');
try {
  console.log(fs.readFileSync(`${base}\\dto\\TrackingResponseDTO.java`, 'utf8'));
} catch (e) {
  console.log('Error reading TrackingResponseDTO:', e.message);
}

console.log('=== ShipmentSummaryDTO.java ===');
try {
  console.log(fs.readFileSync(`${base}\\dto\\ShipmentSummaryDTO.java`, 'utf8'));
} catch (e) {
  console.log('Error reading ShipmentSummaryDTO:', e.message);
}

console.log('=== ShipmentService.java ===');
try {
  console.log(fs.readFileSync(`${base}\\service\\ShipmentService.java`, 'utf8'));
} catch (e) {
  console.log('Error reading ShipmentService:', e.message);
}
