const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.java')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(baseDir);
console.log(`Found ${files.length} java files.`);

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('setPassword') || content.includes('change-password') || content.includes('changePassword') || content.includes('resetPassword') || content.includes('reset-password')) {
    console.log('\n--- Match in:', f.replace(baseDir, ''));
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('setPassword') || line.includes('change-password') || line.includes('changePassword') || line.includes('resetPassword') || line.includes('reset-password') || line.includes('passwordEncoder.encode')) {
        console.log(`  Line ${idx + 1}: ${line.trim()}`);
      }
    });
  }
}
