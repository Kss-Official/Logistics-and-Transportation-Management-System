const fs = require('fs');
const path = require('path');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

function readFileSafe(relPath) {
  const fullPath = path.join(BACKEND_BASE, relPath);
  if (fs.existsSync(fullPath)) {
    return fs.readFileSync(fullPath, 'utf8');
  }
  return `FILE NOT FOUND: ${fullPath}`;
}

console.log("=== SecurityConfig.java ===");
const sec = readFileSafe("config/SecurityConfig.java");
sec.split('\n').filter(l => l.includes('requestMatchers') || l.includes('hasRole') || l.includes('hasAnyRole') || l.includes('permitAll')).forEach(l => console.log(l));
