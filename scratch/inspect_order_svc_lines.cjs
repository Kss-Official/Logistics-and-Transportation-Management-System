const fs = require('fs');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service";

const content = fs.readFileSync(`${BACKEND_BASE}/OrderService.java`, 'utf8');
const lines = content.split('\n');
console.log(lines.slice(245, 275).join('\n'));
