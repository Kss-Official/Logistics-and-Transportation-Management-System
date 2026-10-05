const fs = require('fs');

let testScript = fs.readFileSync('scratch/test_admin_portal_e2e.cjs', 'utf8');
testScript = testScript.replace(
  "const createOrderRes = await postJson('/api/orders', orderPayload, custToken);",
  "const createOrderRes = await postJson('/api/customer/orders', orderPayload, custToken);"
);

fs.writeFileSync('scratch/test_admin_portal_e2e.cjs', testScript, 'utf8');
console.log('Fixed customer order endpoint in test_admin_portal_e2e.cjs');
