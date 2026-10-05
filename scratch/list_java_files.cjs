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
files.forEach(f => console.log(f.replace(ROOT, '')));
