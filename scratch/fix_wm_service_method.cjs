const fs = require('fs');

const f = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerService.java';
let content = fs.readFileSync(f, 'utf8');

const target = '    public WarehouseShipmentDTO markPacked(Long id) {\n        return updateShipmentStage(id, "PACKED");\n    }';
const replacement = '    public WarehouseShipmentDTO markPacked(Long id) {\n        return updateShipmentStage(id, "PACKED");\n    }\n\n    public WarehouseShipmentDTO markReadyForDispatch(Long id) {\n        return updateShipmentStage(id, "READY_FOR_DISPATCH");\n    }';

content = content.replace(target, replacement);

fs.writeFileSync(f, content, 'utf8');
console.log('markReadyForDispatch added to WarehouseManagerService.java');
