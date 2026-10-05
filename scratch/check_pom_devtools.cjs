const fs = require('fs');
const path = require('path');
const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const pom = fs.readFileSync(path.join(BACKEND_DIR, 'pom.xml'), 'utf8');
console.log('Has devtools:', pom.includes('spring-boot-devtools'));
