const fs = require('fs');
const path = require('path');

const backendDir = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management";

function findFiles(dir, matchStrs) {
    const results = [];
    function scan(d) {
        for (const item of fs.readdirSync(d)) {
            if (item === 'target' || item === '.git') continue;
            const full = path.join(d, item);
            if (fs.statSync(full).isDirectory()) scan(full);
            else {
                for (const m of matchStrs) {
                    if (item.toLowerCase().includes(m.toLowerCase())) {
                        results.push(path.relative(backendDir, full));
                        break;
                    }
                }
            }
        }
    }
    scan(dir);
    return results;
}

const authFiles = findFiles(backendDir, ['auth', 'reset', 'password', 'user', 'security', 'datainit']);
console.log("=== Auth / Password / User Files in Backend ===");
console.log(authFiles);
