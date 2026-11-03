const fs = require('fs');
const path = require('path');

const testDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\test\\java';

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(full));
    } else {
      results.push(full);
    }
  });
  return results;
}

console.log(walk(testDir));
