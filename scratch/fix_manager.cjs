const { Client } = require('pg');

async function fix() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'primeroute_db',
    password: 'postgres123',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL primeroute_db');
    const before = await client.query("SELECT id, warehouse_code, warehouse_name, manager_name, manager_email FROM warehouses;");
    console.log('Warehouses Before:', before.rows);

    await client.query("UPDATE warehouses SET manager_name = 'Priya Sharma', manager_email = 'priya@primeroute.com' WHERE warehouse_code = 'WH-BLR-001'");
    
    const after = await client.query("SELECT id, warehouse_code, warehouse_name, manager_name, manager_email FROM warehouses WHERE warehouse_code = 'WH-BLR-001';");
    console.log('Warehouses After:', after.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

fix();
