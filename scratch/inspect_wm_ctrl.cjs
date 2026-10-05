const fs = require('fs');
const path = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\controller\\WarehouseManagerController.java';
const content = fs.readFileSync(path, 'utf8');
console.log(content.substring(0, 1500));
