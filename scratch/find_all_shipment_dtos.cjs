const fs = require('fs');
const path = require('path');
const base = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

function findFiles(dir) {
  let res = [];
  const list = fs.readdirSync(dir);
  for (const f of list) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) res = res.concat(findFiles(full));
    else if (f.endsWith('.java')) res.push(full);
  }
  return res;
}

const allJava = findFiles(base);
console.log('--- SHIPMENT DTOS ---');
allJava.filter(f => f.includes('dto') && (f.toLowerCase().includes('shipment') || f.toLowerCase().includes('tracking'))).forEach(f => {
  console.log(path.relative(base, f));
});

console.log('--- SERVICES WITH SHIPMENT ---');
allJava.filter(f => f.includes('service') && (f.toLowerCase().includes('shipment') || f.toLowerCase().includes('driver') || f.toLowerCase().includes('warehouse'))).forEach(f => {
  console.log(path.relative(base, f));
});
