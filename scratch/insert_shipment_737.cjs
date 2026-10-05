const { execSync } = require('child_process');
const psqlPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe';

function query(sql) {
  try {
    return execSync(`"${psqlPath}" -U postgres -d primeroute_db -c "${sql}"`, {
      env: { ...process.env, PGPASSWORD: 'postgres123' },
      encoding: 'utf8'
    });
  } catch (err) {
    return 'Error: ' + err.message + '\n' + (err.stderr ? err.stderr.toString() : '');
  }
}

console.log(query(`
  INSERT INTO shipments (
    tracking_number, order_id, origin_warehouse_id, status, operational_stage,
    assignment_status, assigned_by, current_location_name, current_latitude, current_longitude,
    estimated_delivery_date, created_at, updated_at
  ) VALUES (
    'PR-TRK-96307644', 737, 1, 'CONFIRMED', 'READY_FOR_PROCESSING',
    'Awaiting Warehouse Assignment', 'SYSTEM - AUTOMATIC FULFILLMENT',
    'Bengaluru Central Hub (WH-BLR-001)', 12.9716, 77.5946,
    CURRENT_DATE, NOW(), NOW()
  ) RETURNING id, tracking_number, origin_warehouse_id, status;
`));
