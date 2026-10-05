const fs = require('fs');
const path = require('path');

function findFiles(dir, match) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(filePath, match));
    } else if (file.toLowerCase().includes(match.toLowerCase())) {
      results.push(filePath);
    }
  }
  return results;
}

const backendDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
console.log(findFiles(backendDir, 'WarehouseShipmentDTO'));
