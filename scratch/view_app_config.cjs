const fs = require('fs');
const path = require('path');
const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

const propPath = path.join(BACKEND_DIR, 'src/main/resources/application.properties');
const ymlPath = path.join(BACKEND_DIR, 'src/main/resources/application.yml');

if (fs.existsSync(propPath)) {
  console.log('=== application.properties ===');
  console.log(fs.readFileSync(propPath, 'utf8'));
}
if (fs.existsSync(ymlPath)) {
  console.log('=== application.yml ===');
  console.log(fs.readFileSync(ymlPath, 'utf8'));
}
