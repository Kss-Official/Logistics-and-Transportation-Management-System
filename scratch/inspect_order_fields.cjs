const fs = require('fs');
const path = require('path');
const BACKEND_SRC = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

const ord = fs.readFileSync(path.join(BACKEND_SRC, 'entity/Order.java'), 'utf8');
console.log(ord);