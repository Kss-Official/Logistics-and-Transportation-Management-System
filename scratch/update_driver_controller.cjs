const fs = require('fs');

const targetPath = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\controller\\DriverPortalController.java';

let content = fs.readFileSync(targetPath, 'utf8');

content = content.replace(
  /User user = userRepository\.findByEmail\(authentication\.getName\(\)\)\s*\.orElseThrow\(\(\) -> new RuntimeException\("User not found"\)\);/g,
  `User user = userRepository.findByEmailIgnoreCase(authentication.getName())
                .or(() -> userRepository.findByEmail(authentication.getName()))
                .orElseThrow(() -> new RuntimeException("User not found"));`
);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('DriverPortalController.java updated successfully!');
