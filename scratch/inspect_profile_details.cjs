const fs = require('fs');
const path = require('path');
const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

function show(rel) {
  console.log('=== ' + rel + ' ===');
  console.log(fs.readFileSync(path.join(BACKEND_DIR, rel), 'utf8'));
}

show('src/main/java/com/primeroute/logistics/controller/ProfileController.java');
show('src/main/java/com/primeroute/logistics/service/ProfileService.java');
show('src/main/java/com/primeroute/logistics/dto/ProfileDTO.java');
show('src/main/java/com/primeroute/logistics/dto/ProfileUpdateRequest.java');
show('src/main/java/com/primeroute/logistics/entity/User.java');
show('src/main/java/com/primeroute/logistics/entity/SupportContact.java');
