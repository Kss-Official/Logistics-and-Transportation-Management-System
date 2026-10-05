const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres123@localhost:5432/primeroute_db'
  });

  await client.connect();
  console.log('Connected to PostgreSQL');

  console.log('\n--- 1. WAREHOUSES ---');
  const whRes = await client.query(`
    SELECT id, warehouse_code, warehouse_name, warehouse_type, status, address_line1, city, state, postal_code, country, latitude, longitude, manager_id, operating_status
    FROM warehouses
    ORDER BY id
  `);
  console.table(whRes.rows);

  console.log('\n--- 2. INVENTORIES PER WAREHOUSE ---');
  const invRes = await client.query(`
    SELECT w.warehouse_code, w.warehouse_name, count(i.id) as item_count, sum(i.available_stock) as total_available_stock
    FROM warehouses w
    LEFT JOIN inventories i ON w.id = i.warehouse_id
    GROUP BY w.id, w.warehouse_code, w.warehouse_name
    ORDER BY w.id
  `);
  console.table(invRes.rows);

  console.log('\n--- 3. ORDER PR-ORD-76406402 DETAILS ---');
  const ordRes = await client.query(`
    SELECT o.id, o.order_number, o.status, o.origin_warehouse_id, o.destination_warehouse_id,
           o.pickup_address_id, o.delivery_address_id,
           pa.address_line1 as pickup_line1, pa.address_line2 as pickup_line2, pa.city as pickup_city, pa.state as pickup_state, pa.postal_code as pickup_pin, pa.latitude as pickup_lat, pa.longitude as pickup_lon,
           da.address_line1 as del_line1, da.address_line2 as del_line2, da.city as del_city, da.state as del_state, da.postal_code as del_pin, da.latitude as del_lat, da.longitude as del_lon
    FROM orders o
    LEFT JOIN addresses pa ON o.pickup_address_id = pa.id
    LEFT JOIN addresses da ON o.delivery_address_id = da.id
    WHERE o.order_number = 'PR-ORD-76406402'
  `);
  console.table(ordRes.rows);

  console.log('\n--- 4. SHIPMENTS FOR ORDER PR-ORD-76406402 ---');
  const shipRes = await client.query(`
    SELECT s.id, s.tracking_number, s.status, s.origin_warehouse_id, s.destination_warehouse_id, s.current_stage, s.driver_id, s.vehicle_id
    FROM shipments s
    JOIN orders o ON s.order_id = o.id
    WHERE o.order_number = 'PR-ORD-76406402'
  `);
  console.table(shipRes.rows);

  console.log('\n--- 5. FULFILLMENT ALLOCATIONS FOR ORDER PR-ORD-76406402 ---');
  const faRes = await client.query(`
    SELECT fa.id, fa.order_id, fa.origin_warehouse_id, fa.status, fa.allocation_method, fa.failure_reason, fa.allocated_at
    FROM fulfillment_allocations fa
    JOIN orders o ON fa.order_id = o.id
    WHERE o.order_number = 'PR-ORD-76406402'
  `);
  console.table(faRes.rows);

  console.log('\n--- 6. WAREHOUSE MANAGERS ---');
  const wmRes = await client.query(`
    SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.warehouse_id, w.warehouse_code, w.warehouse_name
    FROM users u
    LEFT JOIN warehouses w ON u.warehouse_id = w.id
    WHERE u.role = 'ROLE_WAREHOUSE_MANAGER' OR u.role = 'WAREHOUSE_MANAGER'
  `);
  console.table(wmRes.rows);

  await client.end();
}

main().catch(console.error);
