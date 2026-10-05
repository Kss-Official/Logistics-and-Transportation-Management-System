const { execSync } = require('child_process');

process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

// Check columns of shipments table
console.log('=== SHIPMENTS COLUMNS ===');
console.log(execSync(`${PSQL} -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'shipments' ORDER BY ordinal_position;"`, { encoding: 'utf8', env: process.env }));

// Add column last_location_updated_at if not present
try {
  execSync(`${PSQL} -c "ALTER TABLE shipments ADD COLUMN IF NOT EXISTS last_location_updated_at TIMESTAMP;"`, { encoding: 'utf8', env: process.env });
  console.log('✓ Added/Verified shipments.last_location_updated_at column');
} catch (e) {
  console.log('Error altering table:', e.message);
}
