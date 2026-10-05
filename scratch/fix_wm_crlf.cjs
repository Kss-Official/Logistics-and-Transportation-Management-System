const fs = require('fs');

const f = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerService.java';
let content = fs.readFileSync(f, 'utf8');

const lines = content.split(/\r?\n/);
const newLines = [];

for (let i = 0; i < lines.length; i++) {
  newLines.push(lines[i]);
  if (lines[i].includes('public WarehouseShipmentDTO markPacked(Long id) {')) {
    // Check if next line is return updateShipmentStage(id, "PACKED"); and closing brace
    newLines.push(lines[i+1]);
    newLines.push(lines[i+2]);
    newLines.push('');
    newLines.push('    public WarehouseShipmentDTO markReadyForDispatch(Long id) {');
    newLines.push('        return updateShipmentStage(id, "READY_FOR_DISPATCH");');
    newLines.push('    }');
    i += 2;
  }
}

fs.writeFileSync(f, newLines.join('\r\n'), 'utf8');
console.log('Successfully inserted markReadyForDispatch into WarehouseManagerService.java');
