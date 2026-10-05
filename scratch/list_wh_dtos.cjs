const fs = require('fs');
const path = require('path');
const basePath = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\dto\\warehouse";

if (fs.existsSync(basePath)) {
  console.log(fs.readdirSync(basePath));
} else {
  console.log("Not found");
}
