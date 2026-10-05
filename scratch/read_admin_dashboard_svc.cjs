const fs = require('fs');
const path = require('path');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service";

const content = fs.readFileSync(path.join(BACKEND_BASE, 'AdminDashboardService.java'), 'utf8');
console.log(content);
