const fs = require('fs');
const path = require('path');

const base = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

const filesToInspect = [
  'controller/AuthController.java',
  'service/AuthService.java',
  'dto/RegisterRequest.java',
  'dto/LoginRequest.java',
  'dto/AuthResponse.java',
  'exception/GlobalExceptionHandler.java',
  'security/SecurityConfig.java'
];

filesToInspect.forEach(rel => {
  const full = path.join(base, rel);
  if (fs.existsSync(full)) {
    console.log(`=== FILE: ${rel} ===`);
    console.log(fs.readFileSync(full, 'utf8'));
  } else {
    console.log(`=== FILE NOT FOUND: ${rel} ===`);
  }
});
