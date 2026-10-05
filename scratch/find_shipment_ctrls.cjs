const fs = require('fs');
const path = require('path');

const base = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

function findFiles(dir, match) {
  let res = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      res = res.concat(findFiles(full, match));
    } else if (match.test(file)) {
      res.push(full);
    }
  }
  return res;
}

const controllers = findFiles(path.join(base, 'controller'), /\.java$/);
console.log('Controllers:');
controllers.forEach(c => {
  const content = fs.readFileSync(c, 'utf8');
  if (content.includes('shipments') || content.includes('Shipment')) {
    console.log(path.basename(c));
  }
});
