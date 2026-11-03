const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/primeroute_db'
});

async function main() {
  await client.connect();
  const res = await client.query(`
    SELECT s.id, s.tracking_number, s.status, s.operational_stage, s.assignment_status, s.driver_id,
           d.email as driver_email, d.full_name as driver_name, o.order_number, o.status as order_status,
           o.payment_method, o.payment_status, o.total_amount
    FROM shipments s
    LEFT JOIN drivers d ON s.driver_id = d.id
    LEFT JOIN orders o ON s.order_id = o.id
    WHERE s.tracking_number = 'PR-TRK-PBNHJEW3'
  `);
  console.log('Shipment:', JSON.stringify(res.rows, null, 2));

  const allDriverShipments = await client.query(`
    SELECT s.id, s.tracking_number, s.status, s.operational_stage, s.assignment_status, s.driver_id, d.email as driver_email
    FROM shipments s
    JOIN drivers d ON s.driver_id = d.id
  `);
  console.log('All assigned shipments count:', allDriverShipments.rows.length);
  console.log('Assigned shipments:', JSON.stringify(allDriverShipments.rows, null, 2));

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
