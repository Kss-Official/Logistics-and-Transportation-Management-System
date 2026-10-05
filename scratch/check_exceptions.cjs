const fs = require("fs");
const path = require("path");

const BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

const content = fs.readFileSync(path.join(BASE, 'exception/GlobalExceptionHandler.java'), 'utf8');
console.log(content);
