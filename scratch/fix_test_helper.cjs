const fs = require('fs');
const path = require('path');
const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

const f = path.join(BACKEND_DIR, 'src/test/java/com/primeroute/logistics/service/FulfillmentEngineServiceTest.java');
let content = fs.readFileSync(f, 'utf8');

if (!content.includes('private Address createAddress(')) {
  const insertIndex = content.indexOf('private Inventory createInventory(');
  const helper = `    private Address createAddress(String city, String state, String postalCode) {
        Address addr = new Address();
        addr.setCity(city);
        addr.setState(state);
        addr.setPostalCode(postalCode);
        return addr;
    }

`;
  content = content.slice(0, insertIndex) + helper + content.slice(insertIndex);
  fs.writeFileSync(f, content, 'utf8');
  console.log('Added createAddress helper to FulfillmentEngineServiceTest.java');
} else {
  console.log('createAddress already present');
}
