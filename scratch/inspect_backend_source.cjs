const fs = require('fs');
const path = require('path');

const BACKEND_SRC = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java';

function searchDir(dir, results = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath, results);
    } else if (file.endsWith('.java')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (
          line.includes('CommandLineRunner') ||
          line.includes('ApplicationRunner') ||
          line.includes('DataInitializer') ||
          line.includes('UserInitializer') ||
          line.includes('@PostConstruct') ||
          line.includes('passwordEncoder.encode') ||
          line.includes('shrutisanjanasahoo') ||
          line.includes('ramesh@primeroute') ||
          line.includes('priya@primeroute') ||
          line.includes('admin@primeroute') ||
          line.includes('customer@primeroute') ||
          line.includes('setPassword(') ||
          line.includes('save(')
        ) {
          results.push({
            file: path.relative(BACKEND_SRC, fullPath),
            lineNum: idx + 1,
            line: line.trim()
          });
        }
      });
    }
  }
  return results;
}

const res = searchDir(BACKEND_SRC);
console.log(`Found ${res.length} matches in Java sources:`);
for (const r of res) {
  console.log(`${r.file}:${r.lineNum} -> ${r.line}`);
}
