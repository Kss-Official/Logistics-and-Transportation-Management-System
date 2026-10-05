const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

function listDir(dirPath) {
  const full = path.join(BACKEND_BASE, dirPath);
  if (fs.existsSync(full)) {
    return fs.readdirSync(full);
  }
  return [];
}

console.log("=== CONTROLLERS ===");
console.log(listDir("controller"));

console.log("=== SERVICES ===");
console.log(listDir("service"));

console.log("=== REPOSITORIES ===");
console.log(listDir("repository"));

console.log("=== DTOS ===");
console.log(listDir("dto"));

// Query PostgreSQL shipments columns
try {
  const psqlOut = execSync(`"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -c "\\d shipments"`, {
    env: { ...process.env, PGPASSWORD: 'postgres123' },
    encoding: 'utf8'
  });
  console.log("=== DB TABLE shipments ===");
  console.log(psqlOut);
} catch (e) {
  console.error("DB query error:", e.message);
}
