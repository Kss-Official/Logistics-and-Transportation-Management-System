const fs = require('fs');
const path = require('path');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service";

const services = [
  'AdminDriverService.java',
  'AdminVehicleService.java',
  'AdminWarehouseService.java',
  'AdminDashboardService.java',
  'AdminOrderService.java'
];

services.forEach(s => {
  const p = path.join(BACKEND_BASE, s);
  console.log(`\n================== ${s} ==================`);
  if (fs.existsSync(p)) {
    const lines = fs.readFileSync(p, 'utf8').split('\n');
    console.log(`Total lines: ${lines.length}`);
    lines.forEach((l, idx) => {
      const t = l.trim();
      if (t.startsWith('public ') && (t.includes('(') || t.includes('class '))) {
        console.log(`L${idx+1}: ${t}`);
      }
    });
  }
});
