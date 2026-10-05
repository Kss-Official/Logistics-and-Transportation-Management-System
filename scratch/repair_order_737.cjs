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

console.log('--- REPAIRING ORDER 737 ---');

// 1. Update orders table
console.log(query("UPDATE orders SET origin_warehouse_id = 1, updated_at = NOW() WHERE id = 737;"));

// 2. Update fulfillment_allocations table
console.log(query("UPDATE fulfillment_allocations SET warehouse_id = 1, allocation_status = 'ALLOCATED', allocation_score = 190.0, distance_km = 8.5, reason = 'OPTIMAL_WAREHOUSE_ALLOCATED', allocated_by = 'SYSTEM', allocated_at = NOW(), updated_at = NOW() WHERE order_id = 737;"));

// 3. Create or update shipment for order 737
const checkShip = query("SELECT id FROM shipments WHERE order_id = 737;");
if (checkShip.includes('0 rows')) {
  console.log('Inserting shipment...');
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
    );
  `));
}

// 4. Create initial tracking events if none exist
const shipIdOutput = query("SELECT id FROM shipments WHERE order_id = 737;");
console.log('Shipment Query:', shipIdOutput);
const shipIdMatch = shipIdOutput.match(/\n\s*(\d+)\s*\n/);
if (shipIdMatch) {
  const shipId = shipIdMatch[1];
  console.log('Shipment ID:', shipId);
  const checkEvents = query(`SELECT id FROM shipment_tracking_events WHERE shipment_id = ${shipId};`);
  if (checkEvents.includes('0 rows')) {
    console.log('Inserting initial tracking event...');
    console.log(query(`
      INSERT INTO shipment_tracking_events (
        shipment_id, status, title, location_name, description, event_time
      ) VALUES (
        ${shipId}, 'CONFIRMED', 'Order Created & Confirmed', 'Bengaluru Origin Terminal',
        'Booking reference PR-ORD-96307644 registered and logistics order confirmed.', NOW()
      );
    `));
  }
}

console.log('=== VERIFICATION AFTER REPAIR ===');
console.log('--- ORDER 737 ---');
console.log(query("SELECT id, order_number, origin_warehouse_id, status FROM orders WHERE id = 737;"));

console.log('--- ALLOCATION ---');
console.log(query("SELECT id, order_id, warehouse_id, allocation_status, reason FROM fulfillment_allocations WHERE order_id = 737;"));

console.log('--- SHIPMENT ---');
console.log(query("SELECT id, order_id, origin_warehouse_id, tracking_number, status, operational_stage FROM shipments WHERE order_id = 737;"));
