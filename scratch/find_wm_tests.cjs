const fs = require('fs');
const path = require('path');
const BACKEND_ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const TEST_ROOT = path.join(BACKEND_ROOT, 'src', 'test', 'java');

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

const testFiles = getAllFiles(TEST_ROOT);
testFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('WarehouseManagerService')) {
    console.log(`Found WarehouseManagerService in test: ${path.relative(TEST_ROOT, f)}`);
    content.split('\n').forEach((l, i) => {
      if (l.includes('WarehouseManagerService') || l.includes('new WarehouseManagerService')) {
        console.log(`  ${i+1}: ${l.trim()}`);
      }
    });
  }
});
