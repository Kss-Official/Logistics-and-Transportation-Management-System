const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

console.log('=== 1. SHIPMENT TRK-PR-CR4R5P77 ===');
console.log(execSync(`${PSQL} -c "SELECT id, tracking_number, status, driver_id, vehicle_id, route_id, order_id, created_at, updated_at FROM shipments WHERE tracking_number = 'TRK-PR-CR4R5P77';"`, { encoding: 'utf8', env: process.env }));

console.log('=== 2. VEHICLE PR-VH-005 ===');
console.log(execSync(`${PSQL} -c "SELECT id, vehicle_number, registration_number, model, status, driver_id, created_at, updated_at FROM vehicles WHERE vehicle_number = 'PR-VH-005';"`, { encoding: 'utf8', env: process.env }));

console.log('=== 3. DRIVER FOR DRIVER_ID ON SHIPMENT VS VEHICLE ===');
console.log(execSync(`${PSQL} -c "SELECT id, full_name, phone, license_number, status FROM drivers WHERE id IN (13, 19);"`, { encoding: 'utf8', env: process.env }));

console.log('=== 4. ALL SHIPMENTS ON PR-VH-005 ===');
console.log(execSync(`${PSQL} -c "SELECT s.id, s.tracking_number, s.status, s.driver_id, d.full_name, s.vehicle_id, v.vehicle_number FROM shipments s LEFT JOIN drivers d ON s.driver_id = d.id LEFT JOIN vehicles v ON s.vehicle_id = v.id WHERE v.vehicle_number = 'PR-VH-005';"`, { encoding: 'utf8', env: process.env }));
