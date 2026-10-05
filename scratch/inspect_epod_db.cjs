const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

console.log('--- SHIPMENT PR-TRK-CGKQN6B2 ---');
console.log(execSync(`${PSQL} -c "SELECT id, tracking_number, status, operational_stage, driver_id, vehicle_id FROM shipments WHERE tracking_number = 'PR-TRK-CGKQN6B2';"`, { encoding: 'utf8', env: process.env }));

console.log('--- PROOF OF DELIVERIES FOR ALL SHIPMENTS ---');
console.log(execSync(`${PSQL} -c "SELECT id, shipment_id, recipient_name, received_by, delivered_at, created_at FROM proof_of_deliveries;"`, { encoding: 'utf8', env: process.env }));

console.log('--- ALL SHIPMENTS FOR DRIVER RAMESH ---');
console.log(execSync(`${PSQL} -c "SELECT s.id, s.tracking_number, s.status, s.operational_stage, s.driver_id, d.email, d.full_name FROM shipments s LEFT JOIN drivers d ON s.driver_id = d.id;"`, { encoding: 'utf8', env: process.env }));
