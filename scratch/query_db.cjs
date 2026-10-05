const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:postgres123@localhost:5432/primeroute_db'
});

async function run() {
  await client.connect();
  const users = await client.query('SELECT id, email, username, role, full_name FROM users');
  console.log('Users in DB:');
  console.table(users.rows);

  const shipments = await client.query(`
    SELECT s.id, s.tracking_number, s.status, s.assignment_status, s.driver_id, s.vehicle_id, s.origin_warehouse_id,
           s.current_location_name, s.estimated_delivery_date,
           o.order_number, o.customer_id, o.pickup_address_id, o.delivery_address_id, o.delivery_type,
           u.email as customer_email, u.full_name as customer_name,
           d.full_name as driver_name, v.vehicle_number, w.warehouse_name as origin_wh_name
    FROM shipments s
    LEFT JOIN orders o ON s.order_id = o.id
    LEFT JOIN users u ON o.customer_id = u.id
    LEFT JOIN drivers d ON s.driver_id = d.id
    LEFT JOIN vehicles v ON s.vehicle_id = v.id
    LEFT JOIN warehouses w ON s.origin_warehouse_id = w.id
    WHERE s.tracking_number = 'PR-TRK-WQ73ENPZ' OR o.order_number = 'PR-ORD-23292654'
  `);
  console.log('Shipment query result:');
  console.table(shipments.rows);

  const events = await client.query(`
    SELECT id, shipment_id, status, title, description, location_name, event_time
    FROM shipment_tracking_events
    WHERE shipment_id = ${shipments.rows[0]?.id || 0}
    ORDER BY event_time ASC
  `);
  console.log('Shipment Tracking Events:');
  console.table(events.rows);

  // Check addresses
  if (shipments.rows.length > 0) {
    const pickupId = shipments.rows[0].pickup_address_id;
    const deliveryId = shipments.rows[0].delivery_address_id;
    const addresses = await client.query(`
      SELECT * FROM addresses WHERE id IN (${pickupId || 0}, ${deliveryId || 0})
    `);
    console.log('Addresses:');
    console.table(addresses.rows);
  }

  await client.end();
}

run().catch(console.error);
