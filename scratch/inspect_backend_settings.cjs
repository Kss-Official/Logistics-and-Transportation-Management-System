const fs = require('fs');
const path = require('path');

const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

function findFiles(dir, matchPattern) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(filePath, matchPattern));
    } else {
      if (matchPattern.test(file)) {
        results.push(filePath);
      }
    }
  }
  return results;
}

console.log('--- Searching for relevant Java files in backend ---');
const javaFiles = findFiles(path.join(BACKEND_DIR, 'src', 'main', 'java'), /\.java$/);
console.log(`Found ${javaFiles.length} java files.`);

const relevant = javaFiles.filter(f => /User|Auth|Security|Setting|Config|Support|Contact|Profile/i.test(path.basename(f)));
relevant.forEach(f => {
  console.log(path.relative(BACKEND_DIR, f));
});
