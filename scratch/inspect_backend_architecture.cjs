const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

function findFiles(dir, match) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(full, match));
    } else {
      if (match.test(file)) results.push(full);
    }
  });
  return results;
}

const files = findFiles(baseDir, /(Warehouse|Shipment|Order).*(\.java)$/i);
console.log('Found files:', files);

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  console.log(`\n=== FILE: ${path.basename(f)} === (${content.length} chars)`);
  // print methods or class header
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('@GetMapping') || line.includes('@PostMapping') || line.includes('@PatchMapping') || line.includes('public class') || line.includes('public interface')) {
      console.log(`  Line ${idx+1}: ${line.trim()}`);
    }
  });
});
