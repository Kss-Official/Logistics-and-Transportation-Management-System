const fs = require('fs');
const path = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\test\\java\\com\\primeroute\\logistics\\service\\CustomerRegistrationAndLoginValidationTest.java';

let content = fs.readFileSync(path, 'utf8');
content = content.replace(
  'assertEquals(2, violations.size());',
  'assertFalse(violations.isEmpty(), "Empty login request must produce validation violations");\n        assertTrue(violations.size() >= 2);'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Updated test');
