const fs = require('fs');
const path = require('path');

const basePath = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

function searchWord(dir, word) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      searchWord(full, word);
    } else if (f.name.endsWith('.java')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes(word)) {
        console.log(`Found in: ${full.replace(basePath, '')}`);
      }
    }
  }
}

console.log("=== Searching for createShipmentForOrder ===");
searchWord(basePath, "createShipmentForOrder");
console.log("=== Searching for findEligibleOrdersForShipment ===");
searchWord(basePath, "findEligibleOrdersForShipment");
