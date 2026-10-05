const { execSync } = require('child_process');

try {
  const query = `
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'vehicles';
  `;

  const cmd = `powershell -Command "$env:PGPASSWORD = 'postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -c \\"${query.replace(/\n/g, ' ')}\\""`;
  const res = execSync(cmd, { encoding: 'utf8' });
  console.log('--- VEHICLES COLUMNS ---');
  console.log(res);

  const query2 = `
    SELECT * FROM vehicles LIMIT 5;
  `;
  const cmd2 = `powershell -Command "$env:PGPASSWORD = 'postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -c \\"${query2.replace(/\n/g, ' ')}\\""`;
  const res2 = execSync(cmd2, { encoding: 'utf8' });
  console.log('--- VEHICLES DATA ---');
  console.log(res2);

  const query3 = `
    SELECT id, full_name, email, status, warehouse_id FROM drivers LIMIT 10;
  `;
  const cmd3 = `powershell -Command "$env:PGPASSWORD = 'postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -c \\"${query3.replace(/\n/g, ' ')}\\""`;
  const res3 = execSync(cmd3, { encoding: 'utf8' });
  console.log('--- DRIVERS DATA ---');
  console.log(res3);
} catch (e) {
  console.error(e);
}
