const fs = require('fs');

function inspectFile(file) {
  console.log(`\n=================== ${file} ===================`);
  const content = fs.readFileSync(file, 'utf8');
  console.log(content);
}

const servicePath = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/service/OrderService.java';
inspectFile(servicePath);
