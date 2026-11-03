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

const authCtrl = findFile(BACKEND_SRC, 'AuthController');
const userDetails = findFile(BACKEND_SRC, 'CustomUserDetailsService');
const secConfig = findFile(BACKEND_SRC, 'SecurityConfig');

console.log('=== AuthController.java ===');
if (authCtrl) console.log(fs.readFileSync(authCtrl, 'utf8'));

console.log('=== CustomUserDetailsService.java ===');
if (userDetails) console.log(fs.readFileSync(userDetails, 'utf8'));
