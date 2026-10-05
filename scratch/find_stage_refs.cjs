const fs = require('fs');
const path = require('path');

const backendDir = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management";

function grepDir(dir, regex) {
    const results = [];
    function scan(d) {
        const list = fs.readdirSync(d);
        for (const item of list) {
            if (item === 'target' || item === '.git') continue;
            const full = path.join(d, item);
            const stat = fs.statSync(full);
            if (stat.isDirectory()) {
                scan(full);
            } else if (item.endsWith('.java')) {
                const content = fs.readFileSync(full, 'utf8');
                const lines = content.split('\n');
                lines.forEach((l, idx) => {
                    if (regex.test(l)) {
                        results.push(`${path.relative(backendDir, full)}:L${idx+1}: ${l.trim()}`);
                    }
                });
            }
        }
    }
    scan(dir);
    return results;
}

console.log("=== Searching for operationalStage ===");
console.log(grepDir(backendDir, /operationalStage|operational_stage/i).join('\n'));
