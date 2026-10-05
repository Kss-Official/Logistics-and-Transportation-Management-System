const fs = require('fs');
const path = require('path');
const basePath = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";
const wmServicePath = path.join(basePath, "service/WarehouseManagerService.java");

let content = fs.readFileSync(wmServicePath, 'utf8');

content = content.replace(
  /idto\.setCategory\(oi\.getProduct\(\)\.getCategory\(\) != null \? oi\.getProduct\(\)\.getCategory\(\)\.name\(\) : ""\);/,
  `idto.setCategory(oi.getProduct().getCategory() != null ? oi.getProduct().getCategory() : "");`
);

fs.writeFileSync(wmServicePath, content, 'utf8');
console.log("Fixed Product category in WarehouseManagerService.java");
