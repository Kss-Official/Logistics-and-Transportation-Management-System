const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service';

const files = [
  'AdminSettingsService.java',
  'ProfileService.java',
  'ResetPasswordService.java',
  'ForgotPasswordService.java'
];

for (const f of files) {
  console.log(`\n==================== ${f} ====================`);
  console.log(fs.readFileSync(path.join(baseDir, f), 'utf8'));
}
