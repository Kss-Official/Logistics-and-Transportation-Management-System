const fs = require('fs');
const path = require('path');
const ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

function findMatches(rel, word) {
  const p = path.join(ROOT, rel);
  const content = fs.readFileSync(p, 'utf8');
  let idx = 0;
  while ((idx = content.indexOf(word, idx)) !== -1) {
    console.log(`\n=================== Match at ${idx} ===================`);
    console.log(content.substring(Math.max(0, idx - 100), Math.min(content.length, idx + 800)));
    idx += word.length;
  }
}

findMatches('service/AdminShipmentService.java', 'override');
findMatches('service/AdminShipmentService.java', 'assign');
