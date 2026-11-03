const fs = require('fs');
const path = require('path');

const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

function searchAllFiles(dir, matches = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'target' || file === '.git' || file === '.settings') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchAllFiles(fullPath, matches);
    } else {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (
          line.includes('userRepository.save') ||
          line.includes('users SET password') ||
          line.includes('user.setPassword') ||
          line.includes('shrutisanjanasahoo')
        ) {
          matches.push({
            file: path.relative(BACKEND_DIR, fullPath),
            lineNum: idx + 1,
            line: line.trim()
          });
        }
      });
    }
  }
  return matches;
}

const matches = searchAllFiles(BACKEND_DIR);
console.log(`Found ${matches.length} user/password modification points:`);
matches.forEach(m => console.log(`${m.file}:${m.lineNum} -> ${m.line}`));
