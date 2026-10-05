const fs = require('fs');
const path = require('path');

const backendDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const srcDir = path.join(backendDir, 'src', 'main', 'java', 'com', 'primeroute', 'logistics');

function grepFiles(dir, regex) {
  const results = [];
  function search(currentDir) {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        search(fullPath);
      } else if (file.endsWith('.java')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (regex.test(line)) {
            results.push({ file: path.relative(srcDir, fullPath), line: idx + 1, content: line.trim() });
          }
        });
      }
    }
  }
  search(dir);
  return results;
}

console.log('=== USAGES OF destinationWarehouse ===');
console.log(JSON.stringify(grepFiles(srcDir, /destinationWarehouse|destination_warehouse/), null, 2));

console.log('=== USAGES OF originWarehouse ===');
console.log(JSON.stringify(grepFiles(srcDir, /originWarehouse|origin_warehouse/), null, 2));
