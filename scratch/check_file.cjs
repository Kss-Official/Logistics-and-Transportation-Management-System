const fs = require('fs');
const path = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management';
try {
  const list = fs.readdirSync(path);
  console.log('Backend root contents:', list);
} catch (e) {
  console.error(e.message);
}
