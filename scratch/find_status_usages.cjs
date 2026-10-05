const fs = require('fs');
const path = require('path');

const ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.java')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(ROOT);
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  ['DriverStatus.', 'VehicleStatus.'].forEach(term => {
    let idx = 0;
    while ((idx = content.indexOf(term, idx)) !== -1) {
      const snippet = content.substring(Math.max(0, idx - 40), Math.min(content.length, idx + 80)).replace(/\n/g, ' ');
      console.log(`[${path.basename(f)}] ${snippet}`);
      idx += term.length;
    }
  });
});
