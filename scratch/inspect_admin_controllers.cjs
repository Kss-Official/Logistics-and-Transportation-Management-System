const fs = require('fs');
const path = require('path');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

const controllers = [
  'controller/AdminDashboardController.java',
  'controller/AdminDriverController.java',
  'controller/AdminOrderController.java',
  'controller/AdminVehicleController.java',
  'controller/AdminWarehouseController.java',
];

for (const c of controllers) {
  const p = path.join(BACKEND_BASE, c);
  console.log(`\n================== ${c} ==================`);
  if (fs.existsSync(p)) {
    const lines = fs.readFileSync(p, 'utf8').split('\n');
    lines.forEach((line, idx) => {
      const t = line.trim();
      if (t.startsWith('@') || t.startsWith('public ') || t.startsWith('private ')) {
        console.log(`L${idx+1}: ${t}`);
      }
    });
  } else {
    console.log('File not found');
  }
}
