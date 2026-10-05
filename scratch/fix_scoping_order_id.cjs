const fs = require('fs');

const fScoping = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\test\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerShipmentScopingTest.java';

let content = fs.readFileSync(fScoping, 'utf8');
content = content.replace('        order1.setId(501L);\n', '');
content = content.replace('        order2.setId(502L);\n', '');

fs.writeFileSync(fScoping, content, 'utf8');
console.log('Removed setId from Order in WarehouseManagerShipmentScopingTest.java');
