const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:postgres123@localhost:5432/primeroute_db'
});

async function run() {
  await client.connect();
  console.log('--- 1. SHIPMENT & RELATED TABLES FOR PR-TRK-KZ3GJJ6X ---');
  const shipmentRes = await client.query(`
    SELECT s.*
    FROM shipments s
    WHERE s.tracking_number = 'PR-TRK-KZ3GJJ6X'
  `);
  console.log('Shipment row:', JSON.stringify(shipmentRes.rows[0], null, 2));

  if (shipmentRes.rows.length > 0) {
    const s = shipmentRes.rows[0];
    
    // Order
    const orderRes = await client.query(`SELECT * FROM orders WHERE id = $1`, [s.order_id]);
    console.log('Order row:', JSON.stringify(orderRes.rows[0], null, 2));

    // Customer
    if (orderRes.rows[0] && orderRes.rows[0].customer_id) {
      const custRes = await client.query(`SELECT id, email, username, role, full_name, phone_number FROM users WHERE id = $1`, [orderRes.rows[0].customer_id]);
      console.log('Customer row:', JSON.stringify(custRes.rows[0], null, 2));
    }

    // Driver
    if (s.driver_id) {
      const driverRes = await client.query(`SELECT * FROM drivers WHERE id = $1`, [s.driver_id]);
      console.log('Driver row:', JSON.stringify(driverRes.rows[0], null, 2));
    } else {
      console.log('Shipment driver_id is NULL');
    }

    // Vehicle
    if (s.vehicle_id) {
      const vehRes = await client.query(`SELECT * FROM vehicles WHERE id = $1`, [s.vehicle_id]);
      console.log('Vehicle row:', JSON.stringify(vehRes.rows[0], null, 2));
    } else {
      console.log('Shipment vehicle_id is NULL');
    }

    // Tracking Events
    const eventsRes = await client.query(`SELECT * FROM shipment_tracking_events WHERE shipment_id = $1 ORDER BY id ASC`, [s.id]);
    console.log('Tracking events count:', eventsRes.rows.length);
    console.log('Tracking events:', JSON.stringify(eventsRes.rows, null, 2));

    // Proof Of Delivery (ePOD)
    const epodRes = await client.query(`SELECT * FROM proof_of_deliveries WHERE shipment_id = $1`, [s.id]);
    console.log('ePOD rows:', JSON.stringify(epodRes.rows, null, 2));

    // Also check if any driver/vehicle delivered this by checking epod or driver logs or other shipments
    const allDrivers = await client.query(`SELECT id, full_name, phone_number, status, current_vehicle_id FROM drivers`);
    console.log('All drivers:', JSON.stringify(allDrivers.rows, null, 2));

    const allVehicles = await client.query(`SELECT id, vehicle_number, status, model FROM vehicles`);
    console.log('All vehicles:', JSON.stringify(allVehicles.rows, null, 2));
  }

  await client.end();
}

run().catch(console.error);
