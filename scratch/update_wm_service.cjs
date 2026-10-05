const fs = require('fs');
const path = require('path');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";
const filePath = path.join(BACKEND_BASE, "service/WarehouseManagerService.java");
let content = fs.readFileSync(filePath, 'utf8');

const target = `        boolean isOrigin = shipment.getOriginWarehouse() != null && shipment.getOriginWarehouse().getId().equals(warehouse.getId());
        boolean isDest = shipment.getDestinationWarehouse() != null && shipment.getDestinationWarehouse().getId().equals(warehouse.getId());

        if (!isOrigin && !isDest) {`;

const replacement = `        boolean isOrigin = shipment.getOriginWarehouse() != null && shipment.getOriginWarehouse().getId().equals(warehouse.getId());

        if (!isOrigin) {`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully updated getShipmentById to strictly enforce origin warehouse scope");
} else {
  // Try CRLF
  const targetCRLF = target.replace(/\n/g, '\r\n');
  const replacementCRLF = replacement.replace(/\n/g, '\r\n');
  if (content.includes(targetCRLF)) {
    content = content.replace(targetCRLF, replacementCRLF);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Successfully updated getShipmentById (CRLF) to strictly enforce origin warehouse scope");
  } else {
    console.error("Could not find target in WarehouseManagerService.java");
  }
}
