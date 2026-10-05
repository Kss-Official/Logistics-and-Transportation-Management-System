const fs = require('fs');
const path = require('path');
const BASE = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics';

function findFiles(dir, match) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(full, match));
    } else if (file.toLowerCase().includes(match.toLowerCase())) {
      results.push(full);
    }
  });
  return results;
}

const controllers = findFiles(path.join(BASE, 'controller'), '');
controllers.forEach(c => {
  const content = fs.readFileSync(c, 'utf8');
  if (content.includes('shipment') || content.includes('Shipment')) {
    console.log('=== ' + c + ' ===');
    console.log(content.slice(0, 1000));
  }
});
