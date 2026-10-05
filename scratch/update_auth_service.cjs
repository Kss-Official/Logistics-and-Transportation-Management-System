const fs = require('fs');
const p = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\AuthService.java';
let content = fs.readFileSync(p, 'utf8');

const oldTarget = `"Sanjana@10", "Sahoo@123", "Sanjana@123", "Sahoo@321", "Sahoo123", "Sanjana123", "Shruu@123", "admin123", "customer123"`;
const newTarget = `"Sanj@102026", "Sanjana@10", "Sahoo@123", "Sanjana@123", "Sahoo@321", "Sahoo123", "Sanjana123", "Shruu@123", "admin123", "customer123"`;

if (content.includes(oldTarget)) {
  content = content.replace(oldTarget, newTarget);
  fs.writeFileSync(p, content, 'utf8');
  console.log('Successfully added Sanjana@10 and Sahoo@123 to validCandidates in AuthService.java');
} else {
  console.log('Target not found or already updated');
}
