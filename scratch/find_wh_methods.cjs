const fs = require('fs');

const srvPath = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerService.java';
const srvContent = fs.readFileSync(srvPath, 'utf8');
const srvLines = srvContent.split('\n');

srvLines.forEach((l, i) => {
  if (l.includes('getReports') || l.includes('getNotifications')) {
    console.log(`SRV Line ${i+1}:`);
    for (let j = Math.max(0, i - 2); j < Math.min(srvLines.length, i + 35); j++) {
      console.log(`${j+1}: ${srvLines[j]}`);
    }
  }
});
