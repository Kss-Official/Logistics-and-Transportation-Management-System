const fs = require('fs');
const path = require('path');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute";

const filesToInspect = [
  'controller/AdminDashboardController.java',
  'controller/AdminDriverController.java',
  'controller/AdminVehicleController.java',
  'controller/AdminWarehouseController.java',
  'controller/AdminOrderController.java',
  'service/AdminDashboardService.java',
  'service/AdminDriverService.java',
  'service/AdminVehicleService.java',
  'service/AdminWarehouseService.java',
  'service/AdminOrderService.java',
];

for (const rel of filesToInspect) {
  const p = path.join(BACKEND_BASE, rel);
  if (fs.existsSync(p)) {
    console.log(`\n================== ${rel} ==================`);
    const content = fs.readFileSync(p, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('@GetMapping') || line.includes('@PostMapping') || line.includes('@PutMapping') || line.includes('@DeleteMapping') || line.includes('@PatchMapping') || line.includes('public class ') || line.includes('public interface ') || line.includes('@RequestMapping')) {
        console.log(`Line ${idx+1}: ${line.trim()}`);
      }
    });
  } else {
    console.log(`NOT FOUND: ${rel}`);
  }
}
