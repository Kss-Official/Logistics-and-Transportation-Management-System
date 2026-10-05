const fs = require('fs');
const path = require('path');
const backendDir = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management";

function findTests(dir) {
    const res = [];
    function scan(d) {
        for (const item of fs.readdirSync(d)) {
            const full = path.join(d, item);
            if (fs.statSync(full).isDirectory()) scan(full);
            else if (item.endsWith('.java')) {
                res.push(path.relative(backendDir, full));
            }
        }
    }
    scan(path.join(backendDir, 'src/test/java'));
    return res;
}

console.log(findTests(backendDir).join('\n'));
