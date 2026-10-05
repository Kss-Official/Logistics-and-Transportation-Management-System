const fs = require('fs');
const path = require('path');

const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

const filesToRead = [
  'src/main/java/com/primeroute/logistics/controller/ProfileController.java',
  'src/main/java/com/primeroute/logistics/service/ProfileService.java',
  'src/main/java/com/primeroute/logistics/dto/ProfileDTO.java',
  'src/main/java/com/primeroute/logistics/dto/ProfileUpdateRequest.java',
  'src/main/java/com/primeroute/logistics/entity/User.java',
  'src/main/java/com/primeroute/logistics/entity/SupportContact.java',
  'src/main/java/com/primeroute/logistics/config/SecurityConfig.java',
  'src/main/java/com/primeroute/logistics/controller/AdminSupportController.java',
];

filesToRead.forEach(f => {
  const full = path.join(BACKEND_DIR, f);
  console.log('====================================================');
  console.log('FILE:', f);
  if (fs.existsSync(full)) {
    console.log(fs.readFileSync(full, 'utf8'));
  } else {
    console.log('FILE NOT FOUND!');
  }
});
