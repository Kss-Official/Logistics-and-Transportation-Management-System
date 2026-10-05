const fs = require('fs');
const path = require('path');
const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

function read(rel) {
  const p = path.join(BACKEND_DIR, rel);
  console.log('=== ' + rel + ' ===');
  if (fs.existsSync(p)) {
    console.log(fs.readFileSync(p, 'utf8'));
  } else {
    console.log('NOT FOUND: ' + p);
  }
}

read('src/main/java/com/primeroute/logistics/dto/AdminSecurityChangePasswordRequest.java');
read('src/main/java/com/primeroute/logistics/controller/AdminSettingsController.java');
read('src/main/java/com/primeroute/logistics/service/AdminSettingsService.java');
