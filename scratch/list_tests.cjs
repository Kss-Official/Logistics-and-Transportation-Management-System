const fs = require('fs');
const path = require('path');

const backendDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const testDir = path.join(backendDir, 'src', 'test', 'java');

function listFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(listFiles(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

console.log('=== TEST FILES ===');
console.log(listFiles(testDir).map(f => path.relative(testDir, f)));
