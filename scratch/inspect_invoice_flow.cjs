const fs = require('fs');
const path = require('path');

const BACKEND_SRC = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java';

function searchFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(searchFiles(fullPath));
        } else if (file.endsWith('.java')) {
            results.push(fullPath);
        }
    }
    return results;
}

const allJava = searchFiles(BACKEND_SRC);
console.log('Total java files:', allJava.length);

const invoiceFiles = allJava.filter(f => f.toLowerCase().includes('invoice') || f.toLowerCase().includes('order'));
console.log('\nRelevant files:');
invoiceFiles.forEach(f => console.log(f.replace(BACKEND_SRC, '')));
