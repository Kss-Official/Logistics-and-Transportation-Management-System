const fs = require('fs');
const path = require('path');

const base = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

['controller/AuthController.java', 'service/AuthService.java', 'dto/RegisterRequest.java', 'dto/LoginRequest.java', 'dto/AuthResponse.java'].forEach(rel => {
  const full = path.join(base, rel);
  console.log(`\n================== ${rel} ==================`);
  if (fs.existsSync(full)) {
    console.log(fs.readFileSync(full, 'utf8'));
  } else {
    console.log('NOT FOUND');
  }
});
