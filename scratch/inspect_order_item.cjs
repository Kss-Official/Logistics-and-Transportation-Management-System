const fs = require('fs');
const path = require('path');
const basePath = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

function readSnippet(relPath) {
  const full = path.join(basePath, relPath);
  if (fs.existsSync(full)) {
    console.log(`=== ${relPath} ===`);
    console.log(fs.readFileSync(full, 'utf8'));
  }
}

readSnippet("dto/OrderItemDTO.java");
readSnippet("entity/OrderItem.java");
