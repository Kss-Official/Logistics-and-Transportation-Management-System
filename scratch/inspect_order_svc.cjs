const fs = require('fs');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service";

const content = fs.readFileSync(`${BACKEND_BASE}/OrderService.java`, 'utf8');
const lines = content.split('\n');
console.log('--- OrderService.java createOrder lines ---');
lines.forEach((l, idx) => {
  if (l.includes('createOrder') || l.includes('shipmentRepository.save') || l.includes('new Shipment')) {
    console.log(`L${idx+1}: ${l.trim()}`);
  }
});
