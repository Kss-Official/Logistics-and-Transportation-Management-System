const fs = require("fs");
const path = require("path");

const BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\dto";

console.log("Files matching Assign:");
for (const f of fs.readdirSync(BASE)) {
  if (f.toLowerCase().includes("assign")) {
    console.log(f);
    console.log(fs.readFileSync(path.join(BASE, f), 'utf8'));
  }
}
