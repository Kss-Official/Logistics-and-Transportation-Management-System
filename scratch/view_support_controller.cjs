const fs = require('fs');
const path = require('path');
const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

console.log('=== SupportTicketController.java ===');
console.log(fs.readFileSync(path.join(BACKEND_DIR, 'src/main/java/com/primeroute/logistics/controller/SupportTicketController.java'), 'utf8'));
