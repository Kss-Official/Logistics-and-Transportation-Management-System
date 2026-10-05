const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';
const svcPath = path.join(BACKEND_BASE, 'service\\DriverPortalService.java');
let svc = fs.readFileSync(svcPath, 'utf8');

// 1. Add ResourceNotFoundException import if missing
if (!svc.includes('import com.primeroute.logistics.exception.ResourceNotFoundException;')) {
  svc = svc.replace(
    'package com.primeroute.logistics.service;\n',
    'package com.primeroute.logistics.service;\n\nimport com.primeroute.logistics.exception.ResourceNotFoundException;\n'
  );
}

// 2. Fix resolveAuthenticatedDriver(principal) -> getAuthenticatedDriver()
svc = svc.replace(
  'Driver driver = resolveAuthenticatedDriver(principal);',
  'Driver driver = getAuthenticatedDriver();'
);

fs.writeFileSync(svcPath, svc, 'utf8');
console.log('✓ Fixed DriverPortalService.java imports and auth resolution');
