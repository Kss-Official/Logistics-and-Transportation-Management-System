const { Client } = require('pg');

async function check() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres123',
    database: 'primeroute_db'
  });
  await client.connect();

  const res = await client.query(`
    SELECT id, email, full_name, role, status, 
           SUBSTRING(password, 1, 7) as hash_prefix, 
           LENGTH(password) as hash_length,
           updated_at, created_at
    FROM users 
    WHERE LOWER(email) = 'shrutisanjanasahoo@gmail.com'
  `);

  console.log("=== Customer User Row in PostgreSQL ===");
  console.table(res.rows);

  const tokens = await client.query(`
    SELECT prt.id, prt.user_id, prt.expiry_date, prt.used, prt.created_at
    FROM password_reset_tokens prt
    JOIN users u ON prt.user_id = u.id
    WHERE LOWER(u.email) = 'shrutisanjanasahoo@gmail.com'
    ORDER BY prt.created_at DESC;
  `);

  console.log("\n=== Password Reset Tokens for User ===");
  console.table(tokens.rows);

  await client.end();
}

check().catch(console.error);
