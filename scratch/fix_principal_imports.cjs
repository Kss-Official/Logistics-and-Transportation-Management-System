const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

// 1. DriverPortalController.java
const ctrlPath = path.join(BACKEND_BASE, 'controller\\DriverPortalController.java');
let ctrlContent = fs.readFileSync(ctrlPath, 'utf8');
if (!ctrlContent.includes('import java.security.Principal;')) {
  ctrlContent = ctrlContent.replace('package com.primeroute.logistics.controller;\r\n', 'package com.primeroute.logistics.controller;\r\n\r\nimport java.security.Principal;\r\n');
  fs.writeFileSync(ctrlPath, ctrlContent, 'utf8');
  console.log('✓ Added Principal import to DriverPortalController.java');
}

// 2. DriverPortalService.java
const svcPath = path.join(BACKEND_BASE, 'service\\DriverPortalService.java');
let svcContent = fs.readFileSync(svcPath, 'utf8');
if (!svcContent.includes('import java.security.Principal;')) {
  svcContent = svcContent.replace('package com.primeroute.logistics.service;\r\n', 'package com.primeroute.logistics.service;\r\n\r\nimport java.security.Principal;\r\n');
  fs.writeFileSync(svcPath, svcContent, 'utf8');
  console.log('✓ Added Principal import to DriverPortalService.java');
}
