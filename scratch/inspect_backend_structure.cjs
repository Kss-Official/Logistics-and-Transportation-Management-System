const fs = require('fs');
const path = require('path');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute";

function listFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(listFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

const allFiles = listFiles(BACKEND_BASE);
console.log(`Total backend files: ${allFiles.length}`);

console.log("\n--- Controllers ---");
allFiles.filter(f => f.includes('controller')).forEach(f => console.log(path.basename(f)));

console.log("\n--- Models/Entities ---");
allFiles.filter(f => f.includes('model') || f.includes('entity')).forEach(f => console.log(path.basename(f)));

console.log("\n--- Services ---");
allFiles.filter(f => f.includes('service') && !f.includes('impl')).forEach(f => console.log(path.basename(f)));

console.log("\n--- Repositories ---");
allFiles.filter(f => f.includes('repository')).forEach(f => console.log(path.basename(f)));
