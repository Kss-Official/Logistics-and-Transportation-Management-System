const fs = require('fs');
const path = require('path');

const backendSrc = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java';

function walk(dir) {
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

const allFiles = walk(backendSrc);
const relevant = allFiles.filter(f => /Auth|User|Exception|Register|Validation|Security|GlobalExceptionHandler|Dto/i.test(f));
console.log(JSON.stringify(relevant, null, 2));
