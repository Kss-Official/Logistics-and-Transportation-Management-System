const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432 -X';

function query(sql) {
  const cmd = `${PSQL} -c "${sql.replace(/"/g, '\\"')}"`;
  return execSync(cmd, { encoding: 'utf8', env: process.env });
}

console.log("=== TABLES ===");
console.log(query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;"));

console.log("=== DRIVERS SCHEMA ===");
console.log(query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='drivers';"));

console.log("=== VEHICLES SCHEMA ===");
console.log(query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='vehicles';"));

console.log("=== FOREIGN KEYS REFERENCING WAREHOUSES, DRIVERS, VEHICLES ===");
console.log(query(`
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;
`));
