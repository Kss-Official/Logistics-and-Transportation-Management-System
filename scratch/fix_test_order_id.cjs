const fs = require('fs');
const testPath = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/test/java/com/primeroute/logistics/service/WarehouseManagerPickPackTest.java';
let content = fs.readFileSync(testPath, 'utf8');
content = content.replace('sampleOrder.setId(501L);', 'org.springframework.test.util.ReflectionTestUtils.setField(sampleOrder, "id", 501L);');
fs.writeFileSync(testPath, content, 'utf8');
console.log('Fixed sampleOrder.setId in test');
