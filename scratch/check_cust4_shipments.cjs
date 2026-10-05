const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

function query(sql) {
  return execSync(`${PSQL} -c "${sql}"`, { encoding: 'utf8', env: process.env });
}

console.log('--- SHIPMENTS FOR CUSTOMER 4 ---');
console.log(query(`
  SELECT s.id, s.tracking_number, s.status as shipment_status, o.id as order_id, o.order_number, o.status as order_status, o.customer_id
  FROM shipments s
  JOIN orders o ON s.order_id = o.id
  WHERE o.customer_id = 4;
`));

console.log('--- ALL SHIPMENTS WITH CUSTOMER ---');
console.log(query(`
  SELECT s.id, s.tracking_number, s.status as shipment_status, o.customer_id, u.email
  FROM shipments s
  JOIN orders o ON s.order_id = o.id
  JOIN users u ON o.customer_id = u.id;
`));
