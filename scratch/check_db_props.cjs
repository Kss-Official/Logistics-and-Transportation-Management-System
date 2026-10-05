const fs = require('fs');
const path = require('path');

const BACKEND_RES = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\resources";

for (const f of fs.readdirSync(BACKEND_RES)) {
  console.log(f);
  console.log(fs.readFileSync(path.join(BACKEND_RES, f), 'utf8'));
}
