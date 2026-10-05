const fs = require('fs');
const base = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

function findFiles(dir) {
  let res = [];
  const list = fs.readdirSync(dir);
  for (const f of list) {
    const full = dir + '\\' + f;
    if (fs.statSync(full).isDirectory()) res = res.concat(findFiles(full));
    else if (f.endsWith('.java')) res.push(full);
  }
  return res;
}

const dtos = findFiles(base + '\\dto');
dtos.forEach(d => {
  if (d.toLowerCase().includes('proof') || d.toLowerCase().includes('delivery') || d.toLowerCase().includes('pod')) {
    console.log(d);
  }
});
