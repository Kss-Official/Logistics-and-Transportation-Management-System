const fs = require('fs');
const path = require('path');
const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

const content = fs.readFileSync(path.join(BACKEND_DIR, 'src/main/java/com/primeroute/logistics/service/SupportTicketService.java'), 'utf8');
const lines = content.split('\n');
console.log(lines.slice(60, 85).join('\n'));
