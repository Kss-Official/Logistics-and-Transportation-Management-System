const fs = require('fs');

const f1 = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerService.java';
console.log(fs.readFileSync(f1, 'utf8').substring(0, 1500));
