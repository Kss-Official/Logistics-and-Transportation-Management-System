const fs = require('fs');
const path = require('path');
const basePath = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

function readSnippet(relPath, startLine, count) {
  const full = path.join(basePath, relPath);
  if (fs.existsSync(full)) {
    const lines = fs.readFileSync(full, 'utf8').split('\n');
    console.log(`=== ${relPath} (lines ${startLine} to ${startLine + count} of ${lines.length}) ===`);
    console.log(lines.slice(startLine - 1, startLine - 1 + count).join('\n'));
  } else {
    console.log(`NOT FOUND: ${full}`);
  }
}

readSnippet("controller/WarehouseManagerController.java", 140, 100);
readSnippet("service/WarehouseManagerService.java", 1, 100);
readSnippet("service/WarehouseManagerService.java", 101, 150);
