const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/primeroute_db'
});
async function inspectDrivers() {
  await client.connect();
  const res = await client.query("SELECT id, email, role, status FROM users WHERE role = 'DRIVER'");
  console.log('Driver users in users table:', res.rows);
  const drv = await client.query("SELECT id, email, full_name, status FROM drivers");
  console.log('Drivers in drivers table:', drv.rows);
  await client.end();
}
inspectDrivers();
