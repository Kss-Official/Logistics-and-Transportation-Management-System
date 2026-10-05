const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432 -X';
const res = execSync(`${PSQL} -f "d:/Transportation-Logistic/scratch/cleanup.sql"`, { encoding: 'utf8', env: process.env });
console.log(res);
