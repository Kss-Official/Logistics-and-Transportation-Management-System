const fs = require('fs');
const path = require('path');
const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

const p = path.join(BACKEND_DIR, 'src/main/java/com/primeroute/logistics/service/AdminSettingsService.java');
const content = fs.readFileSync(p, 'utf8');
const lines = content.split('\n');
console.log(lines.slice(0, 140).join('\n'));
