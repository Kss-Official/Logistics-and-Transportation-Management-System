const fs = require('fs');
const path = require('path');

const backendRoot = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

const files = [
  'entity/ProofOfDelivery.java',
  'repository/ProofOfDeliveryRepository.java',
  'dto/driver/ProofOfDeliveryDTO.java',
  'dto/driver/CompleteDeliveryRequest.java',
  'dto/driver/DriverDeliveryDTO.java',
  'service/DriverPortalService.java',
  'controller/DriverPortalController.java'
];

for (const rel of files) {
  const full = path.join(backendRoot, rel);
  if (fs.existsSync(full)) {
    let content = fs.readFileSync(full, 'utf8');
    // Remove BOM if present
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    fs.writeFileSync(full, content, { encoding: 'utf8' });
    console.log(`Cleaned UTF-8 BOM from: ${rel}`);
  }
}
