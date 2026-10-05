const { spawnSync } = require('child_process');
const psqlPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe';

const sql = `
  INSERT INTO shipments (
    id, tracking_number, order_id, origin_warehouse_id, status, operational_stage,
    assignment_status, assigned_by, current_location_name, current_latitude, current_longitude,
    estimated_delivery_date, created_at, updated_at
  ) VALUES (
    (SELECT COALESCE(MAX(id), 0) + 1 FROM shipments),
    'PR-TRK-96307644', 737, 1, 'CONFIRMED', 'READY_FOR_PROCESSING',
    'Awaiting Warehouse Assignment', 'SYSTEM - AUTOMATIC FULFILLMENT',
    'Bengaluru Central Hub (WH-BLR-001)', 12.9716, 77.5946,
    CURRENT_DATE, NOW(), NOW()
  ) RETURNING id, tracking_number, origin_warehouse_id, status;
`;

const res = spawnSync(psqlPath, ['-U', 'postgres', '-d', 'primeroute_db', '-c', sql], {
  env: { ...process.env, PGPASSWORD: 'postgres123' },
  encoding: 'utf8'
});

console.log('STDOUT:', res.stdout);
console.log('STDERR:', res.stderr);
console.log('STATUS:', res.status);
