const fs = require('fs');
const path = require('path');
const reportDir = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\target\\surefire-reports";

if (fs.existsSync(reportDir)) {
  const files = fs.readdirSync(reportDir);
  for (const f of files) {
    if (f.includes("LogisticsManagementApplicationTests") && f.endsWith(".txt")) {
      console.log(`=== ${f} ===`);
      console.log(fs.readFileSync(path.join(reportDir, f), 'utf8'));
    }
  }
}
