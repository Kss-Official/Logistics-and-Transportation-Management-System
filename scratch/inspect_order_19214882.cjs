const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'primeroute_db',
    user: 'postgres',
    password: 'postgres123',
  });

  await client.connect();

  const orderRes = await client.query(`
    SELECT o.id, o.order_number, o.status, o.origin_warehouse_id,
           pa.city as pickup_city, pa.state as pickup_state, pa.address_line1 as pickup_addr,
           da.city as del_city, da.state as del_state, da.address_line1 as del_addr,
           w.warehouse_code, w.warehouse_name
    FROM orders o
    LEFT JOIN addresses pa ON o.pickup_address_id = pa.id
    LEFT JOIN addresses da ON o.delivery_address_id = da.id
    LEFT JOIN warehouses w ON o.origin_warehouse_id = w.id
    WHERE o.order_number = 'PR-ORD-19214882'
  `);

  console.log('=== ORDER PR-ORD-19214882 ===');
  console.log(orderRes.rows);

  const shipmentRes = await client.query(`
    SELECT s.id, s.tracking_number, s.status, s.operational_stage,
           s.origin_warehouse_id, ow.warehouse_code as origin_code, ow.warehouse_name as origin_name,
           s.destination_warehouse_id, dw.warehouse_code as dest_code, dw.warehouse_name as dest_name,
           s.driver_id, s.vehicle_id
    FROM shipments s
    LEFT JOIN orders o ON s.order_id = o.id
    LEFT JOIN warehouses ow ON s.origin_warehouse_id = ow.id
    LEFT JOIN warehouses dw ON s.destination_warehouse_id = dw.id
    WHERE o.order_number = 'PR-ORD-19214882'
  `);

  console.log('=== LINKED SHIPMENT ===');
  console.log(shipmentRes.rows);

  const allWarehouses = await client.query(`SELECT id, warehouse_code, warehouse_name, city, state FROM warehouses WHERE status = 'ACTIVE'`);
  console.log('=== ACTIVE WAREHOUSES ===');
  console.log(allWarehouses.rows);

  await client.end();
}

main().catch(console.error);
