const fs = require('fs');
const path = require('path');
const ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

function showMethod(rel, methodName) {
  const p = path.join(ROOT, rel);
  const content = fs.readFileSync(p, 'utf8');
  const idx = content.indexOf(methodName);
  if (idx !== -1) {
    console.log(`\n=================== ${rel} (${methodName}) ===================`);
    console.log(content.substring(idx - 100, idx + 1500));
  } else {
    console.log(`Method ${methodName} not found in ${rel}`);
  }
}

showMethod('service/AdminShipmentService.java', 'assign');
