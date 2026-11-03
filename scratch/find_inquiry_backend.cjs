const fs = require('fs');
const path = require('path');

const base = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java';

function searchInFiles(dir) {
  const list = fs.readdirSync(dir);
  let hits = [];
  list.forEach(item => {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      hits = hits.concat(searchInFiles(full));
    } else if (item.endsWith('.java')) {
      const content = fs.readFileSync(full, 'utf8');
      if (/inquiry|quotation|freight.*consultation|quote|contact|consultation/i.test(content)) {
        hits.push(full);
      }
    }
  });
  return hits;
}

console.log(searchInFiles(base));
