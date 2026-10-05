const { execSync } = require('child_process');

const controllers = [
  'WarehouseManagerController.java',
  'NotificationController.java',
  'SupportTicketController.java',
  'ProfileController.java',
  'FaqController.java'
];

controllers.forEach(c => {
  console.log(`\n================== ${c} ==================`);
  try {
    const content = execSync(`powershell -Command "Get-Content (Get-ChildItem -Recurse 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src' -Filter '${c}').FullName"`, { encoding: 'utf8' });
    const lines = content.split('\n');
    lines.forEach(line => {
      if (line.includes('@RequestMapping') || line.includes('@GetMapping') || line.includes('@PostMapping') || line.includes('@PutMapping') || line.includes('@PatchMapping') || line.includes('@DeleteMapping') || line.includes('public class')) {
        console.log(line.trim());
      }
    });
  } catch (err) {
    console.error(`Error reading ${c}:`, err.message);
  }
});
