const fs = require('fs');
const path = require('path');
const BACKEND_SRC = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

const invSvc = fs.readFileSync(path.join(BACKEND_SRC, 'service/InvoiceService.java'), 'utf8');
const lines = invSvc.split('\n');
console.log(lines.slice(60, 150).join('\n'));