const fs = require('fs');
const path = require('path');

const BACKEND_SRC = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java';

function findFile(dir, name) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      const found = findFile(fullPath, name);
      if (found) return found;
    } else if (file.toLowerCase().includes(name.toLowerCase())) {
      return fullPath;
    }
  }
  return null;
}

const authService = findFile(BACKEND_SRC, 'AuthService.java');
console.log('=== AuthService.java ===');
if (authService) console.log(fs.readFileSync(authService, 'utf8'));
