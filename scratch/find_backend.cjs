const fs = require('fs');
const path = require('path');

const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

function findFiles(dir, filter) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(filePath, filter));
    } else if (filter(file, filePath)) {
      results.push(filePath);
    }
  }
  return results;
}

const javaFiles = findFiles(BACKEND_DIR, (f) => f.endsWith('.java'));
console.log(`Found ${javaFiles.length} Java files:`);
javaFiles.forEach(f => {
  if (f.includes('Fulfillment') || f.includes('Order') || f.includes('Warehouse') || f.includes('Shipment')) {
    console.log(f.replace(BACKEND_DIR, ''));
  }
});
