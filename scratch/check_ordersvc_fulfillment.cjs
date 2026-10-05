const fs = require('fs');

const f1 = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\OrderService.java';
const f2 = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\FulfillmentEngineService.java';

if (fs.existsSync(f1)) {
  const content = fs.readFileSync(f1, 'utf8');
  console.log('OrderService lines:', content.split('\n').length);
}
if (fs.existsSync(f2)) {
  const content = fs.readFileSync(f2, 'utf8');
  console.log('FulfillmentEngineService lines:', content.split('\n').length);
}
