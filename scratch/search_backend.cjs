const fs = require('fs');
const path = require('path');

function searchDir(dir, query) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      searchDir(p, query);
    } else if (f.name.endsWith('.java') || f.name.endsWith('.sql') || f.name.endsWith('.properties') || f.name.endsWith('.yml')) {
      const content = fs.readFileSync(p, 'utf8');
      if (content.toLowerCase().includes(query.toLowerCase())) {
        console.log(`Found in: ${p}`);
        content.split('\n').forEach((l, idx) => {
          if (l.toLowerCase().includes(query.toLowerCase())) {
            console.log(`  Line ${idx + 1}: ${l.trim()}`);
          }
        });
      }
    }
  }
}

searchDir('C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src', 'Suresh');
