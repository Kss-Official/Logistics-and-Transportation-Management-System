const fs = require('fs');
const base = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

try {
  console.log('=== ProofOfDelivery.java ===');
  console.log(fs.readFileSync(`${base}\\entity\\ProofOfDelivery.java`, 'utf8'));
} catch (e) {
  console.log('Error reading ProofOfDelivery.java:', e.message);
}

try {
  console.log('=== ProofOfDeliveryRepository.java ===');
  console.log(fs.readFileSync(`${base}\\repository\\ProofOfDeliveryRepository.java`, 'utf8'));
} catch (e) {
  console.log('Error reading ProofOfDeliveryRepository.java:', e.message);
}
