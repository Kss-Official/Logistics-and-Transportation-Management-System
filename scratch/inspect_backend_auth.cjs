const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

const filesToInspect = [
  'config/SecurityConfig.java',
  'controller/AuthController.java',
  'service/AuthService.java',
  'service/CustomUserDetailsService.java',
  'repository/UserRepository.java'
];

for (const f of filesToInspect) {
  const fullPath = path.join(baseDir, f);
  console.log(`\n================== ${f} ==================`);
  if (fs.existsSync(fullPath)) {
    console.log(fs.readFileSync(fullPath, 'utf8'));
  } else {
    console.log('FILE NOT FOUND:', fullPath);
  }
}
