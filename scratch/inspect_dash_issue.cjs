const fs = require('fs');
const path = require('path');

const backendDir = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management";

function findFiles(dir, matchStr) {
    const results = [];
    function scan(d) {
        const list = fs.readdirSync(d);
        for (const item of list) {
            const full = path.join(d, item);
            const stat = fs.statSync(full);
            if (stat.isDirectory()) {
                scan(full);
            } else if (item.includes(matchStr)) {
                results.push(full);
            }
        }
    }
    scan(dir);
    return results;
}

console.log("Searching for WarehouseManagerService, DashboardDTO, ShipmentRepository...");
const wmServices = findFiles(backendDir, "WarehouseManagerService");
const dashDTOs = findFiles(backendDir, "DashboardDTO");
const shipRepos = findFiles(backendDir, "ShipmentRepository");
const wmCtrls = findFiles(backendDir, "WarehouseManagerController");

console.log({ wmServices, dashDTOs, shipRepos, wmCtrls });

if (dashDTOs.length > 0) {
    console.log("=== DashboardDTO ===");
    console.log(fs.readFileSync(dashDTOs[0], 'utf8'));
}

if (wmServices.length > 0) {
    console.log("=== WarehouseManagerService (getDashboard / count methods) ===");
    const content = fs.readFileSync(wmServices[0], 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
        if (line.includes('Dashboard') || line.includes('readyToProcess') || line.includes('picking') || line.includes('packed') || line.includes('readyForDispatch') || line.includes('operationalStage')) {
            console.log(`L${idx+1}: ${line}`);
        }
    });
}
