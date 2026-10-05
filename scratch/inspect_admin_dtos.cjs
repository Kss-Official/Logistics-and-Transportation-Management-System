const fs = require('fs');
const path = require('path');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

const dtos = [
  'dto/AdminDashboardSummaryDTO.java',
  'dto/AdminDriverDTO.java',
  'dto/VehicleDTO.java',
  'dto/WarehouseDTO.java',
  'dto/AdminOrderResponseDTO.java'
];

for (const d of dtos) {
  const p = path.join(BACKEND_BASE, d);
  console.log(`\n================== ${d} ==================`);
  if (fs.existsSync(p)) {
    console.log(fs.readFileSync(p, 'utf8'));
  } else {
    console.log('File not found');
  }
}
