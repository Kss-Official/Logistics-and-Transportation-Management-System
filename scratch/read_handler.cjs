const fs = require('fs');
const path = require('path');

const handlerPath = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\exception\\GlobalExceptionHandler.java';
console.log(fs.readFileSync(handlerPath, 'utf8'));
