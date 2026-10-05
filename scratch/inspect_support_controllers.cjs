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

console.log('=== CONTROLLERS ===');
const controllers = findFiles(baseDir, 'controller');
for (const c of controllers) {
  if (c.toLowerCase().includes('support')) {
    console.log(`\n--- ${path.basename(c)} (${c}) ---`);
    console.log(fs.readFileSync(c, 'utf8'));
  }
}

console.log('\n=== SECURITY CONFIG ===');
const secFiles = findFiles(baseDir, 'SecurityConfig');
for (const s of secFiles) {
  console.log(`\n--- ${path.basename(s)} ---`);
  const content = fs.readFileSync(s, 'utf8');
  // Print lines with support or requestMatchers
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('support') || lines[i].includes('authorizeHttpRequests')) {
      console.log(lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 15)).join('\n'));
      break;
    }
  }
}
