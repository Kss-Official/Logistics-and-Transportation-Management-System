const { Client } = require('pg');

async function check() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres123@localhost:5432/primeroute_db'
  });
  await client.connect();
  const users = await client.query('SELECT id, full_name, email, role FROM users WHERE role IN (\'ADMIN\', \'WAREHOUSE_MANAGER\')');
  console.log('Admin and WM users:', users.rows);
  await client.end();
}

check();
