const fs = require('fs');

const files = [
  'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\controller\\CustomerDashboardController.java',
  'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\dto\\CustomerDashboardDTO.java',
  'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\entity\\OrderStatus.java'
];

for (const f of files) {
  console.log(`\n=================== ${f} ===================`);
  if (fs.existsSync(f)) {
    console.log(fs.readFileSync(f, 'utf8'));
  } else {
    console.log('NOT FOUND');
  }
}
