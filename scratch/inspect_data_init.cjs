const fs = require('fs');
const p = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\config\\DataInitializer.java';
if (fs.existsSync(p)) {
  const content = fs.readFileSync(p, 'utf8');
  console.log(content.slice(0, 3000));
} else {
  console.log('NOT FOUND');
}
