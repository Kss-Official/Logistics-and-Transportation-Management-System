const fs = require('fs');
const base = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\test\\java\\com\\primeroute\\logistics";

function findFiles(dir) {
  let res = [];
  if (!fs.existsSync(dir)) return res;
  const list = fs.readdirSync(dir);
  for (const f of list) {
    const full = dir + '\\' + f;
    if (fs.statSync(full).isDirectory()) res = res.concat(findFiles(full));
    else if (f.endsWith('Test.java') || f.endsWith('Tests.java')) res.push(full);
  }
  return res;
}

const tests = findFiles(base);
console.log('Backend test files:');
tests.forEach(t => console.log(t.replace(base + '\\', '')));
