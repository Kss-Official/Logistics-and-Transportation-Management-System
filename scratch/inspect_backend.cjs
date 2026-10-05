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

const allJavaFiles = getAllFiles(JAVA_ROOT);
console.log(`Found ${allJavaFiles.length} Java files in backend.`);

const categorized = {};
allJavaFiles.forEach(f => {
  const rel = path.relative(JAVA_ROOT, f);
  const parts = rel.split(path.sep);
  const pkg = parts.slice(0, -1).join('.');
  if (!categorized[pkg]) categorized[pkg] = [];
  categorized[pkg].push(path.basename(rel));
});

console.log('--- PACKAGES AND FILES ---');
console.log(JSON.stringify(categorized, null, 2));
