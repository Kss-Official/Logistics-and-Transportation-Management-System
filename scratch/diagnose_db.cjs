const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: 'password' in process.env ? process.env.PGPASSWORD : 'postgres123',
  host: 'localhost',
  port: 5432,
  database: 'primeroute_db'
});

async function main() {
  try {
    await client.connect();
    console.log('Connected to DB primeroute_db');

    console.log('\n=== WAREHOUSES ===');
    const whRes = await client.query('SELECT id, warehouse_code, warehouse_name, city, status FROM warehouses ORDER BY id');
    console.table(whRes.rows);

    console.log('\n=== WAREHOUSE MANAGERS ===');
    const wmRes = await client.query("SELECT id, email, full_name, role, warehouse_id FROM users WHERE role = 'WAREHOUSE_MANAGER' ORDER BY id");
    console.table(wmRes.rows);

    console.log('\n=== DRIVERS ===');
    const drvRes = await client.query('SELECT id, full_name, email, status, warehouse_id, user_id FROM drivers ORDER BY id');
    console.table(drvRes.rows);

    console.log('\n=== VEHICLES ===');
    const vehRes = await client.query('SELECT id, vehicle_number, vehicle_type, status, warehouse_id, assigned_driver_id FROM vehicles ORDER BY id');
    console.table(vehRes.rows);

    console.log('\n=== SHIPMENTS (recent 25) ===');
    const shRes = await client.query('SELECT id, tracking_number, origin_warehouse_id, destination_warehouse_id, operational_stage, status, driver_id, vehicle_id, assignment_status FROM shipments ORDER BY id DESC LIMIT 25');
    console.table(shRes.rows);

    console.log('\n=== ACTIVE SHIPMENTS BY DRIVER ===');
    const actDrv = await client.query("SELECT id, tracking_number, driver_id, operational_stage, status FROM shipments WHERE driver_id IS NOT NULL AND status NOT IN ('DELIVERED', 'CANCELLED')");
    console.table(actDrv.rows);

    console.log('\n=== ACTIVE SHIPMENTS BY VEHICLE ===');
    const actVeh = await client.query("SELECT id, tracking_number, vehicle_id, operational_stage, status FROM shipments WHERE vehicle_id IS NOT NULL AND status NOT IN ('DELIVERED', 'CANCELLED')");
    console.table(actVeh.rows);

    await client.end();
  } catch (err) {
    console.error('DB Error:', err);
  }
}
main();
