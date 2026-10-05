const fs = require('fs');
const path = require('path');

const basePath = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

function readSnippet(relPath, maxLines = 100) {
  const full = path.join(basePath, relPath);
  if (fs.existsSync(full)) {
    const lines = fs.readFileSync(full, 'utf8').split('\n');
    console.log(`=== ${relPath} (total ${lines.length} lines) ===`);
    console.log(lines.slice(0, maxLines).join('\n'));
  } else {
    console.log(`NOT FOUND: ${full}`);
  }
}

readSnippet("controller/WarehouseManagerController.java", 150);
readSnippet("repository/OrderRepository.java", 60);
