const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432 -X';
execSync(`${PSQL} -c "DELETE FROM vehicles WHERE vehicle_number = 'TS-09-EXP-1010';"`, { env: process.env });
execSync(`${PSQL} -c "DELETE FROM drivers WHERE email = 'arjun.das@primeroute.in';"`, { env: process.env });
execSync(`${PSQL} -c "DELETE FROM users WHERE email = 'vikram.rao@primeroute.com';"`, { env: process.env });
execSync(`${PSQL} -c "DELETE FROM warehouses WHERE warehouse_code = 'WH-HYD-TEST';"`, { env: process.env });
console.log('Cleaned test entries.');
