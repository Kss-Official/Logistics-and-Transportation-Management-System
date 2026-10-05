const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

const managerHash = '$2a$10$si6oLMkA0qtM9O/nGMx90eTe5UgLZY/BcP.wMMwtqgD5JcyPBArdO';
const adminHash = '$2a$10$u9TiMvEuJ/KXC/kBBLxKtOJqt7oeSS.CZpir9lkPFjET0lXPttV3m';
const driverHash = '$2a$10$CqzprRnJHTtBNapKH5SnX.4nsSHG6W6romyt6hvYacb0kzOzweRfO';

console.log('Updating passwords in primeroute_db...');

execSync(`${PSQL} -c "UPDATE users SET password = '${managerHash}' WHERE email IN ('priya@primeroute.com', 'ccu.east@primeroute.com');"`, { env: process.env });
execSync(`${PSQL} -c "UPDATE users SET password = '${adminHash}' WHERE email = 'admin@primeroute.com';"`, { env: process.env });
execSync(`${PSQL} -c "UPDATE users SET password = '${driverHash}' WHERE email = 'ramesh@primeroute.com';"`, { env: process.env });

console.log('Passwords updated successfully.');
