const fs = require('fs');
const filePath = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/service/AdminShipmentService.java';
let content = fs.readFileSync(filePath, 'utf8');

const target = `        if (s.getOriginWarehouse() != null) {
            Warehouse wh = s.getOriginWarehouse();
            dto.setWarehouseId(wh.getId());
            dto.setWarehouseCode(wh.getWarehouseCode());
            dto.setWarehouseName(wh.getWarehouseName());
            dto.setWarehouseManagerName(wh.getManagerName() != null ? wh.getManagerName() : "Not Assigned");
            dto.setWarehouseManagerEmail(wh.getManagerEmail() != null ? wh.getManagerEmail() : "");
        }`.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');

const replacement = `        if (s.getOriginWarehouse() != null) {
            Warehouse wh = s.getOriginWarehouse();
            dto.setOriginWarehouseId(wh.getId());
            dto.setOriginWarehouseCode(wh.getWarehouseCode());
            dto.setOriginWarehouseName(wh.getWarehouseName());
            dto.setOriginWarehouseManagerName(wh.getManagerName() != null ? wh.getManagerName() : "Not Assigned");
            dto.setOriginWarehouseManagerEmail(wh.getManagerEmail() != null ? wh.getManagerEmail() : "");
            dto.setWarehouseId(wh.getId());
            dto.setWarehouseCode(wh.getWarehouseCode());
            dto.setWarehouseName(wh.getWarehouseName());
            dto.setWarehouseManagerName(wh.getManagerName() != null ? wh.getManagerName() : "Not Assigned");
            dto.setWarehouseManagerEmail(wh.getManagerEmail() != null ? wh.getManagerEmail() : "");
        }
        if (s.getDestinationWarehouse() != null) {
            Warehouse dwh = s.getDestinationWarehouse();
            dto.setDestinationWarehouseId(dwh.getId());
            dto.setDestinationWarehouseCode(dwh.getWarehouseCode());
            dto.setDestinationWarehouseName(dwh.getWarehouseName());
        }`.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('AdminShipmentService.java updated successfully.');
} else {
    console.log('Target block still not found.');
}
