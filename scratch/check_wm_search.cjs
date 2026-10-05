const fs = require('fs');

const f1 = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerService.java';
const content = fs.readFileSync(f1, 'utf8');
console.log('Contains markReadyForDispatch:', content.includes('markReadyForDispatch'));
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('markReadyForDispatch') || l.includes('markPacked') || l.includes('startPicking')) {
    console.log(`Line ${idx+1}: ${l}`);
  }
});
