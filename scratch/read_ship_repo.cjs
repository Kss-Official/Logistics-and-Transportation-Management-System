const fs = require('fs');
const path = require('path');

const backendDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const shipRepoPath = path.join(backendDir, 'src', 'main', 'java', 'com', 'primeroute', 'logistics', 'repository', 'ShipmentRepository.java');

console.log(fs.readFileSync(shipRepoPath, 'utf8'));
