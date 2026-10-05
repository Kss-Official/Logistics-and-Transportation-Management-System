const fs = require('fs');
const path = require('path');
const BACKEND_ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

const userRepo = path.join(BACKEND_ROOT, 'src', 'main', 'java', 'com', 'primeroute', 'logistics', 'repository', 'UserRepository.java');
console.log('=== UserRepository.java ===');
console.log(fs.readFileSync(userRepo, 'utf8'));

const driverEntity = path.join(BACKEND_ROOT, 'src', 'main', 'java', 'com', 'primeroute', 'logistics', 'entity', 'Driver.java');
console.log('=== Driver.java (top 60 lines) ===');
console.log(fs.readFileSync(driverEntity, 'utf8').split('\n').slice(0, 60).join('\n'));
