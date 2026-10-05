const fs = require('fs');
const targetPath = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/test/java/com/primeroute/logistics/service/DriverRouteNavigationIntegrationTest.java';

let content = fs.readFileSync(targetPath, 'utf8');
content = content.replace(
  'Address deliveryAddr = new Address();',
  `Address pickupAddr = new Address();
        pickupAddr.setCustomer(customer);
        pickupAddr.setAddressType("WAREHOUSE");
        pickupAddr.setContactName("Dispatch Center Hub");
        pickupAddr.setPhone("+91-9988776655");
        pickupAddr.setAddressLine1("Bommasandra Industrial Area");
        pickupAddr.setCity("Bengaluru");
        pickupAddr.setState("Karnataka");
        pickupAddr.setPostalCode("560099");
        pickupAddr.setCountry("India");
        pickupAddr.setLatitude(12.9716);
        pickupAddr.setLongitude(77.5946);
        pickupAddr = addressRepository.save(pickupAddr);

        Address deliveryAddr = new Address();`
);

content = content.replace(
  'orderA.setDeliveryAddress(deliveryAddr);',
  'orderA.setPickupAddress(pickupAddr);\n        orderA.setDeliveryAddress(deliveryAddr);'
);

content = content.replace(
  'orderB.setDeliveryAddress(deliveryAddr);',
  'orderB.setPickupAddress(pickupAddr);\n        orderB.setDeliveryAddress(deliveryAddr);'
);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Added pickup address to DriverRouteNavigationIntegrationTest.java');
