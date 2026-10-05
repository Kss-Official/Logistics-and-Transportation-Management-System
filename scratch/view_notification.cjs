const fs = require('fs');
const path = require('path');
const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

console.log('=== Notification.java ===');
console.log(fs.readFileSync(path.join(BACKEND_DIR, 'src/main/java/com/primeroute/logistics/entity/Notification.java'), 'utf8'));

console.log('=== NotificationController.java ===');
console.log(fs.readFileSync(path.join(BACKEND_DIR, 'src/main/java/com/primeroute/logistics/controller/NotificationController.java'), 'utf8'));
