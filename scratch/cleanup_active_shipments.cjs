const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';

function runSql(sql) {
  const singleLine = sql.replace(/\s+/g, ' ').trim();
  const cmd = `"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432 -c "${singleLine}"`;
  return execSync(cmd, { encoding: 'utf8', env: process.env });
}

console.log('--- BEFORE CLEANUP: Active Shipments ---');
console.log(runSql(`
  SELECT s.id, s.tracking_number, s.status, s.driver_id, d.full_name AS driver, s.vehicle_id, v.vehicle_number AS veh, v.driver_id AS veh_driver
  FROM shipments s
  LEFT JOIN drivers d ON s.driver_id = d.id
  LEFT JOIN vehicles v ON s.vehicle_id = v.id
  WHERE s.status NOT IN ('DELIVERED', 'CANCELLED')
  ORDER BY s.id;
`));

// Execute updates
console.log('Applying data consistency updates...');
runSql(`
  BEGIN;

  -- 1. Shipment 15: unassign vehicle 3 (vehicle 3 belongs to Ramesh)
  UPDATE shipments SET vehicle_id = NULL WHERE id = 15;

  -- 2. Shipment 17: unassign driver 18 (Ramesh is already in active shipment 29)
  UPDATE shipments SET driver_id = NULL WHERE id = 17;

  -- 3. Shipment 19: assign driver 16 (Sneha Kulkarni, who is assigned to vehicle 2 VH-002)
  UPDATE shipments SET driver_id = 16 WHERE id = 19;

  -- 4. Shipment 27: assign vehicle 8 (PR-VH-004, which is assigned to driver 19 Uttam)
  UPDATE shipments SET vehicle_id = 8 WHERE id = 27;

  -- 5. Shipment 29: assign vehicle 3 (VH-003, which is assigned to driver 18 Ramesh)
  UPDATE shipments SET vehicle_id = 3 WHERE id = 29;

  -- 6. Synchronize vehicle statuses
  UPDATE vehicles SET status = 'AVAILABLE' WHERE id = 1;
  UPDATE vehicles SET status = 'ASSIGNED' WHERE id = 2;
  UPDATE vehicles SET status = 'IN_TRANSIT' WHERE id = 3;
  UPDATE vehicles SET status = 'IN_TRANSIT' WHERE id = 8;
  UPDATE vehicles SET status = 'IN_TRANSIT' WHERE id = 9;

  -- 7. Synchronize driver statuses
  UPDATE drivers SET status = 'AVAILABLE' WHERE id = 12;
  UPDATE drivers SET status = 'ON_TRIP' WHERE id = 13;
  UPDATE drivers SET status = 'ON_TRIP' WHERE id = 15;
  UPDATE drivers SET status = 'ON_TRIP' WHERE id = 16;
  UPDATE drivers SET status = 'ON_TRIP' WHERE id = 17;
  UPDATE drivers SET status = 'ON_TRIP' WHERE id = 18;
  UPDATE drivers SET status = 'ON_TRIP' WHERE id = 19;
  UPDATE drivers SET status = 'AVAILABLE' WHERE id = 20;

  COMMIT;
`);

console.log('--- AFTER CLEANUP: Active Shipments ---');
console.log(runSql(`
  SELECT s.id, s.tracking_number, s.status, s.driver_id, d.full_name AS driver, s.vehicle_id, v.vehicle_number AS veh, v.driver_id AS veh_driver,
         CASE WHEN s.vehicle_id IS NULL THEN 'NO_VEHICLE'
              WHEN s.driver_id = v.driver_id THEN 'MATCH'
              ELSE 'MISMATCH' END AS consistency
  FROM shipments s
  LEFT JOIN drivers d ON s.driver_id = d.id
  LEFT JOIN vehicles v ON s.vehicle_id = v.id
  WHERE s.status NOT IN ('DELIVERED', 'CANCELLED')
  ORDER BY s.id;
`));

console.log('--- AFTER CLEANUP: Vehicles ---');
console.log(runSql(`
  SELECT v.id, v.vehicle_number, v.driver_id, d.full_name AS assigned_driver, v.status
  FROM vehicles v
  LEFT JOIN drivers d ON v.driver_id = d.id
  ORDER BY v.id;
`));

console.log('--- AFTER CLEANUP: Drivers ---');
console.log(runSql(`
  SELECT id, full_name, status FROM drivers ORDER BY id;
`));
