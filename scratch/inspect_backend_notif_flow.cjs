const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const JAVA_ROOT = path.join(BACKEND_ROOT, 'src', 'main', 'java');

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else if (file.endsWith('.java')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const files = getAllFiles(JAVA_ROOT);
const matches = [];

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  if (content.toLowerCase().includes('notification')) {
    matches.push({
      file: path.relative(JAVA_ROOT, f),
      lines: content.split('\n').filter(l => l.toLowerCase().includes('notification') || l.includes('/notifications'))
    });
  }
}

console.log(`Found ${matches.length} files referencing notifications:`);
matches.forEach(m => {
  console.log(`\n=== ${m.file} ===`);
  m.lines.slice(0, 10).forEach(l => console.log('  ' + l.trim()));
});
