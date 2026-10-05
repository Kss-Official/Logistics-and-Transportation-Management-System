const { execSync } = require('child_process');

try {
  const query = `
    SELECT d.id as driver_id, d.full_name, d.email, d.status as driver_status, d.warehouse_id,
           v.id as vehicle_id, v.vehicle_number, v.type as vehicle_type, v.model, v.capacity_tons,
           v.status as vehicle_status, v.registration_number, w.warehouse_code, w.name as warehouse_name
    FROM drivers d
    LEFT JOIN vehicles v ON d.id = v.driver_id
    LEFT JOIN warehouses w ON d.warehouse_id = w.id
    ORDER BY d.id ASC;
  `;

  const cmd = `powershell -Command "$env:PGPASSWORD = 'postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -c \\"${query.replace(/\n/g, ' ')}\\""`;
  const res = execSync(cmd, { encoding: 'utf8' });
  console.log('--- ALL DRIVERS AND ASSIGNED VEHICLES ---');
  console.log(res);
} catch (e) {
  console.error(e);
}
