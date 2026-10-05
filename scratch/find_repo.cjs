const fs = require('fs');
const path = require('path');

function findFile(dir, targetName) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findFile(full, targetName);
    } else if (entry.name === targetName) {
      console.log('Found:', full);
      console.log(fs.readFileSync(full, 'utf8'));
    }
  }
}

findFile('C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src', 'InventoryTransactionRepository.java');
