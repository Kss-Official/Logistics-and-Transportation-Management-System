const fs = require('fs');
const path = require('path');
const backendDir = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management";

function grepAll(dir, query) {
    const res = [];
    function scan(d) {
        for (const item of fs.readdirSync(d)) {
            if (item === 'target' || item === '.git') continue;
            const full = path.join(d, item);
            if (fs.statSync(full).isDirectory()) scan(full);
            else if (item.endsWith('.java')) {
                const lines = fs.readFileSync(full, 'utf8').split('\n');
                lines.forEach((l, idx) => {
                    if (l.includes(query)) {
                        res.push(`${path.relative(backendDir, full)}:L${idx+1}: ${l.trim()}`);
                    }
                });
            }
        }
    }
    scan(dir);
    return res;
}

console.log("=== All setPassword / passwordEncoder.encode calls ===");
console.log(grepAll(backendDir, 'setPassword(').join('\n'));
console.log("\n=== passwordEncoder.encode calls ===");
console.log(grepAll(backendDir, 'passwordEncoder.encode(').join('\n'));
