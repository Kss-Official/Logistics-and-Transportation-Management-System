const fs = require('fs');
const base = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

console.log('=== AdminShipmentDTO.java ===');
console.log(fs.readFileSync(`${base}\\dto\\AdminShipmentDTO.java`, 'utf8'));

console.log('=== AdminShipmentService.java mapping methods ===');
const ass = fs.readFileSync(`${base}\\service\\AdminShipmentService.java`, 'utf8');
const lines = ass.split('\n');
const toDtoIdx = lines.findIndex(l => l.includes('toDTO(') || l.includes('toAdminShipmentDTO(') || l.includes('convertToDTO('));
console.log('toDTO line index:', toDtoIdx);
if (toDtoIdx !== -1) {
  console.log(lines.slice(toDtoIdx, toDtoIdx + 120).join('\n'));
} else {
  console.log('Last 100 lines:');
  console.log(lines.slice(-100).join('\n'));
}
