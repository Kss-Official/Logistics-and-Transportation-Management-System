const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres123',
  database: 'primeroute_db'
});

async function main() {
  await client.connect();
  console.log("Connected to primeroute_db");

  const whRes = await client.query('SELECT id, warehouse_code, warehouse_name, city FROM warehouses ORDER BY id');
  console.log("=== Warehouses ===");
  console.table(whRes.rows);

  const ordRes = await client.query(`
    SELECT o.id, o.order_number, o.status, o.origin_warehouse_id, w.warehouse_code as origin_code, 
           pa.city as pickup_city, da.city as delivery_city, o.created_at
    FROM orders o
    LEFT JOIN warehouses w ON o.origin_warehouse_id = w.id
    LEFT JOIN addresses pa ON o.pickup_address_id = pa.id
    LEFT JOIN addresses da ON o.delivery_address_id = da.id
    ORDER BY o.id DESC LIMIT 10
  `);
  console.log("=== Recent Orders ===");
  console.table(ordRes.rows);

  const shipRes = await client.query(`
    SELECT s.id, s.tracking_number, s.status, s.operational_stage, s.order_id, 
           ow.warehouse_code as origin_wh, dw.warehouse_code as dest_wh,
           d.full_name as driver, v.vehicle_number as vehicle
    FROM shipments s
    LEFT JOIN warehouses ow ON s.origin_warehouse_id = ow.id
    LEFT JOIN warehouses dw ON s.destination_warehouse_id = dw.id
    LEFT JOIN drivers d ON s.driver_id = d.id
    LEFT JOIN vehicles v ON s.vehicle_id = v.id
    ORDER BY s.id DESC LIMIT 10
  `);
  console.log("=== Recent Shipments ===");
  console.table(shipRes.rows);

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
