const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/logistic_management',
});

async function main() {
  await client.connect();
  console.log('Connected to PostgreSQL database.');

  const tablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

  console.log('--- ALL TABLES ---');
  tablesRes.rows.forEach(r => console.log(r.table_name));

  console.log('\n--- USERS COLUMNS ---');
  const userCols = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'users'
    ORDER BY ordinal_position;
  `);
  userCols.rows.forEach(r => console.log(`${r.column_name} (${r.data_type})`));

  console.log('\n--- SUPPORT_CONTACTS DATA ---');
  const supportContacts = await client.query('SELECT * FROM support_contacts');
  console.log(supportContacts.rows);

  console.log('\n--- NOTIFICATIONS COLUMNS ---');
  const notifCols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'notifications'
  `);
  notifCols.rows.forEach(r => console.log(`${r.column_name} (${r.data_type})`));

  await client.end();
}

main().catch(err => {
  console.error('Database query error:', err.message);
  process.exit(1);
});
