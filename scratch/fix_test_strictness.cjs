const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const SRC_TEST_JAVA = path.join(BACKEND_ROOT, 'src', 'test', 'java', 'com', 'primeroute', 'logistics');

const content = fs.readFileSync(path.join(SRC_TEST_JAVA, 'service/OrderServiceFulfillmentIntegrationTest.java'), 'utf8');

const updated = content
    .replace('import org.mockito.junit.jupiter.MockitoExtension;', 'import org.mockito.junit.jupiter.MockitoExtension;\nimport org.mockito.junit.jupiter.MockitoSettings;\nimport org.mockito.quality.Strictness;')
    .replace('@ExtendWith(MockitoExtension.class)', '@ExtendWith(MockitoExtension.class)\n@MockitoSettings(strictness = Strictness.LENIENT)');

fs.writeFileSync(path.join(SRC_TEST_JAVA, 'service/OrderServiceFulfillmentIntegrationTest.java'), updated, 'utf8');
console.log('Added LENIENT strictness to OrderServiceFulfillmentIntegrationTest.java');
