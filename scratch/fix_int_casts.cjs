const fs = require('fs');
const path = require('path');

const backendRoot = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';
const dpsPath = path.join(backendRoot, 'service', 'DriverPortalService.java');
let dpsContent = fs.readFileSync(dpsPath, 'utf8');

dpsContent = dpsContent.replace('dto.setFuelLevelPercent(78.0);', 'dto.setFuelLevelPercent(78);');
dpsContent = dpsContent.replace('dto.setEngineTempCelsius(88.0);', 'dto.setEngineTempCelsius(88);');
dpsContent = dpsContent.replace('dto.setTirePressurePsi(35.0);', 'dto.setTirePressurePsi(35);');
dpsContent = dpsContent.replace('dto.setOdometerKm(50600.0);', 'dto.setOdometerKm(50600);');

fs.writeFileSync(dpsPath, dpsContent, 'utf8');
console.log('Fixed int casts in DriverPortalService.java');
