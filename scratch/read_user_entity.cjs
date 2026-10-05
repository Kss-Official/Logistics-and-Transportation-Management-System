const fs = require('fs');
const path = require('path');
const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const p = path.join(BACKEND_DIR, 'src/main/java/com/primeroute/logistics/entity/User.java');
console.log(fs.readFileSync(p, 'utf8'));
