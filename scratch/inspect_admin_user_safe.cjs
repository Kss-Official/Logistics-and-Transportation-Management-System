const { execSync } = require('child_process');

process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

function query(sql) {
  return execSync(`${PSQL} -c "${sql}"`, { encoding: 'utf8', env: process.env });
}

console.log('--- ADMIN USER METADATA (SAFE, NO PASSWORDS) ---');
console.log(query(`
  SELECT 
    id, 
    email, 
    role, 
    status, 
    full_name,
    LENGTH(password) as password_len,
    (password LIKE '$2a$%') as is_bcrypt_2a,
    (password LIKE '$2b$%') as is_bcrypt_2b,
    (password LIKE '$2y$%') as is_bcrypt_2y,
    last_password_change,
    created_at
  FROM users 
  WHERE email = 'admin@primeroute.com';
`));
