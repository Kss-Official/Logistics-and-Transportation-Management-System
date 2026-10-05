const fs = require('fs');
const path = require('path');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute";

function findFiles(dir, match) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(fullPath, match));
    } else if (match.some(m => file.toLowerCase().includes(m.toLowerCase()))) {
      results.push(fullPath);
    }
  });
  return results;
}

const matches = findFiles(BACKEND_BASE, ['AdminDashboard', 'AdminDriver', 'AdminVehicle', 'AdminWarehouse', 'AdminOrder', 'Driver', 'Vehicle', 'Warehouse']);
matches.forEach(m => console.log(m.replace(BACKEND_BASE, '')));
