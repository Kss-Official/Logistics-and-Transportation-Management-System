const { execSync } = require('child_process');

try {
  const psqlQuery = `
    SELECT s.id, s.tracking_number, s.status, s.assignment_status, s.assigned_by,
           s.origin_warehouse_id, w.warehouse_code, w.manager_name,
           d.full_name as driver_name, v.vehicle_number, s.order_id
    FROM shipments s
    LEFT JOIN warehouses w ON s.origin_warehouse_id = w.id
    LEFT JOIN drivers d ON s.driver_id = d.id
    LEFT JOIN vehicles v ON s.vehicle_id = v.id
    ORDER BY s.id DESC
    LIMIT 5;
  `;

  const cmd = `powershell -Command "$env:PGPASSWORD = 'postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -c \\"${psqlQuery.replace(/\n/g, ' ')}\\""`;
  const res = execSync(cmd, { encoding: 'utf8' });
  console.log('--- POSTGRESQL SHIPMENT RECORDS ---');
  console.log(res);

  const eventQuery = `
    SELECT e.id, e.shipment_id, e.title, e.location_name, e.description, e.event_time
    FROM shipment_tracking_events e
    ORDER BY e.id DESC
    LIMIT 5;
  `;
  const eventCmd = `powershell -Command "$env:PGPASSWORD = 'postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -c \\"${eventQuery.replace(/\n/g, ' ')}\\""`;
  const eventRes = execSync(eventCmd, { encoding: 'utf8' });
  console.log('--- POSTGRESQL AUDIT TRACKING EVENTS ---');
  console.log(eventRes);
} catch (e) {
  console.error(e);
}
