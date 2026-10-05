const fs = require("fs");
const path = require("path");

const BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

function walk(dir) {
  let res = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) res = res.concat(walk(p));
    else res.push(p);
  }
  return res;
}

const allFiles = walk(BASE);
console.log("Total Java files:", allFiles.length);
console.log("Shipment files:", allFiles.filter(f => f.toLowerCase().includes("shipment")).map(f => path.relative(BASE, f)));
console.log("Warehouse files:", allFiles.filter(f => f.toLowerCase().includes("warehouse")).map(f => path.relative(BASE, f)));
