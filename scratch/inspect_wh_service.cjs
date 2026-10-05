const { execSync } = require('child_process');

console.log(execSync(`powershell -Command "
Get-Content (Get-ChildItem -Recurse 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src' -Filter 'WarehouseManagerController.java').FullName | Select-String -Pattern 'getReports|getNotifications' -Context 2, 5
"`, { encoding: 'utf8' }));
