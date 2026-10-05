const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

// 1. DriverPortalController.java
const ctrlPath = path.join(BACKEND_BASE, 'controller\\DriverPortalController.java');
let ctrlContent = fs.readFileSync(ctrlPath, 'utf8');
if (!ctrlContent.includes('import java.security.Principal;')) {
  ctrlContent = ctrlContent.replace('package com.primeroute.logistics.controller;', 'package com.primeroute.logistics.controller;\n\nimport java.security.Principal;');
  fs.writeFileSync(ctrlPath, ctrlContent, 'utf8');
  console.log('✓ Added import java.security.Principal to DriverPortalController.java');
}

// 2. DriverPortalService.java
const svcPath = path.join(BACKEND_BASE, 'service\\DriverPortalService.java');
let svcContent = fs.readFileSync(svcPath, 'utf8');
if (!svcContent.includes('import java.security.Principal;')) {
  svcContent = svcContent.replace('package com.primeroute.logistics.service;', 'package com.primeroute.logistics.service;\n\nimport java.security.Principal;');
  fs.writeFileSync(svcPath, svcContent, 'utf8');
  console.log('✓ Added import java.security.Principal to DriverPortalService.java');
}
