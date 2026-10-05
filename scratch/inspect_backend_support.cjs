const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

function findFiles(dir, match) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(filePath, match));
    } else if (file.toLowerCase().includes(match.toLowerCase())) {
      results.push(filePath);
    }
  }
  return results;
}

console.log('=== SUPPORT JAVA FILES IN BACKEND ===');
const supportFiles = findFiles(baseDir, 'support').concat(findFiles(baseDir, 'ticket'));
const uniqueFiles = [...new Set(supportFiles)];
for (const f of uniqueFiles) {
  console.log('-', f.replace(baseDir, ''));
}

console.log('\n=== READING CONTROLLERS ===');
for (const f of uniqueFiles) {
  if (f.includes('controller') || f.includes('Controller')) {
    console.log(`\n--- ${path.basename(f)} ---`);
    console.log(fs.readFileSync(f, 'utf8'));
  }
}

console.log('\n=== READING SERVICES ===');
for (const f of uniqueFiles) {
  if (f.includes('service') || f.includes('Service')) {
    console.log(`\n--- ${path.basename(f)} ---`);
    console.log(fs.readFileSync(f, 'utf8'));
  }
}
