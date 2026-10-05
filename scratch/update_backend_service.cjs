const fs = require('fs');

const file = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerService.java';
let content = fs.readFileSync(file, 'utf8');

const target = 'm.put("dockDoors", 12);';
const addition = `m.put("dockDoors", 12);
        m.put("warehouseType", w.getWarehouseType() != null ? w.getWarehouseType().name() : "DISTRIBUTION_CENTER");
        m.put("status", w.getStatus() != null ? w.getStatus().name() : "ACTIVE");
        m.put("country", w.getCountry() != null ? w.getCountry() : "India");
        m.put("capacityUnit", w.getCapacityUnit() != null ? w.getCapacityUnit() : "KG");
        m.put("contactEmail", w.getContactEmail() != null ? w.getContactEmail() : "");
        m.put("managerPhone", w.getManagerPhone() != null ? w.getManagerPhone() : "");`;

if (content.includes(target) && !content.includes('warehouseType')) {
  content = content.replace(target, addition);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated WarehouseManagerService.java');
} else {
  console.log('Already updated or target not found');
}
