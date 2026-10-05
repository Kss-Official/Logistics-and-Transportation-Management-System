const { execSync } = require('child_process');

try {
  const psqlCmd = `powershell -Command "$env:PGPASSWORD = 'postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -h localhost -c 'SELECT s.id, s.tracking_number, s.status AS ship_status, s.operational_stage, o.id AS order_id, o.order_number, o.status AS order_status FROM shipments s LEFT JOIN orders o ON s.order_id = o.id WHERE s.status IN (\x27DELIVERED\x27, \x27CANCELLED\x27);'"`
  console.log(execSync(psqlCmd).toString());
} catch (e) {
  console.error(e.message);
}
