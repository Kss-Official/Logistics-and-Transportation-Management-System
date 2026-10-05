const fs = require('fs');
const path = require('path');
const basePath = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";
const wmServicePath = path.join(basePath, "service/WarehouseManagerService.java");

const lines = fs.readFileSync(wmServicePath, 'utf8').split('\n');
lines.slice(25, 65).forEach((l, i) => console.log(`${i+26}: ${l}`));
