const { execSync } = require('child_process');

const sql = "SELECT s.id as shipment_id, s.tracking_number, s.origin_warehouse_id, w.warehouse_code, w.warehouse_name, u.email as manager_email FROM shipments s LEFT JOIN warehouses w ON s.origin_warehouse_id = w.id LEFT JOIN users u ON u.warehouse_id = w.id AND u.role = 'WAREHOUSE_MANAGER' WHERE s.id IN (1, 2) ORDER BY s.id;";

const out = execSync(`"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -c "${sql}"`, {
  env: { ...process.env, PGPASSWORD: 'postgres123' },
  encoding: 'utf8'
});

console.log(out);
